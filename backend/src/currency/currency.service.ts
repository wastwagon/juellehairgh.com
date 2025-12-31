import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";
import { ALL_CURRENCIES, getCurrencyByCode } from "./currencies.data";

@Injectable()
export class CurrencyService {
  private baseCurrency = "GHS";

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async getRates() {
    const rates = await this.prisma.currencyRate.findMany({
      where: {
        baseCurrency: this.baseCurrency,
      },
    });

    return rates.reduce((acc, rate) => {
      acc[rate.targetCurrency] = Number(rate.rate);
      return acc;
    }, {} as Record<string, number>);
  }

  async getAllCurrencies() {
    return ALL_CURRENCIES;
  }

  async getRate(targetCurrency: string): Promise<number> {
    if (targetCurrency === this.baseCurrency) {
      return 1;
    }

    const rate = await this.prisma.currencyRate.findUnique({
      where: {
        baseCurrency_targetCurrency: {
          baseCurrency: this.baseCurrency,
          targetCurrency,
        },
      },
    });

    return rate ? Number(rate.rate) : 1;
  }

  async updateRates() {
    // Using exchangerate-api.com Open Access - Completely free, no API key required
    // This is a reliable public API that provides currency exchange rates
    // Updates daily, perfect for 12-hour refresh cycle
    const apiKey = this.configService.get<string>("CURRENCY_API_KEY");
    
    // Primary: Use exchangerate-api.com Open Access (completely free, no API key needed)
    // Fallback: If API key is provided, use exchangerate-api.com authenticated endpoint
    let apiUrl: string;
    let useOpenAccess = false;
    
    if (apiKey) {
      // Use exchangerate-api.com authenticated endpoint if API key is provided
      apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${this.baseCurrency}`;
    } else {
      // Use exchangerate-api.com Open Access - completely free, no registration needed
      apiUrl = `https://open.er-api.com/v6/latest/${this.baseCurrency}`;
      useOpenAccess = true;
    }
    
    return this.fetchAndStoreRates(apiUrl, useOpenAccess);
  }

  private async fetchAndStoreRates(apiUrl: string, useOpenAccess: boolean = false) {
    try {
      const maskedUrl = apiUrl.replace(/\/v6\/[^/]+\//, '/v6/***/').replace(/api_key=[^&]+/, 'api_key=***');
      console.log(`Fetching currency rates from: ${maskedUrl}`);
      
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "JuelleHair-Ecommerce/1.0",
        },
      });

      // Handle API response format
      let rates: Record<string, number>;
      let conversionDate: string;
      
      // exchangerate-api.com format (both authenticated and open access): { rates: {...}, date: "2024-01-01" }
      if (!response.data || !response.data.rates) {
        // Check for error response
        if (response.data?.error || response.data?.result === "error") {
          throw new Error(`API Error: ${response.data.error?.info || response.data["error-type"] || "Unknown error"}`);
        }
        throw new Error("Invalid API response: rates not found");
      }
      
      rates = response.data.rates;
      conversionDate = response.data.date || new Date().toISOString().split("T")[0];
      
      console.log(`Received rates for ${Object.keys(rates).length} currencies`);

      // Get all currency codes we want to support
      const supportedCurrencyCodes = ALL_CURRENCIES.map((c) => c.code);
      
      let updatedCount = 0;
      let createdCount = 0;

      // Store all available rates
      for (const [currencyCode, rate] of Object.entries(rates)) {
        // Only store rates for currencies we support
        if (supportedCurrencyCodes.includes(currencyCode) && typeof rate === "number") {
          // Check if record exists before upsert to track create vs update
          const existedBefore = await this.prisma.currencyRate.findUnique({
            where: {
              baseCurrency_targetCurrency: {
                baseCurrency: this.baseCurrency,
                targetCurrency: currencyCode,
              },
            },
          });

          await this.prisma.currencyRate.upsert({
            where: {
              baseCurrency_targetCurrency: {
                baseCurrency: this.baseCurrency,
                targetCurrency: currencyCode,
              },
            },
            update: {
              rate: rate as number,
            },
            create: {
              baseCurrency: this.baseCurrency,
              targetCurrency: currencyCode,
              rate: rate as number,
            },
          });

          // Track create vs update
          if (!existedBefore) {
            createdCount++;
          } else {
            updatedCount++;
          }
        }
      }

      console.log(`Currency rates updated: ${createdCount} created, ${updatedCount} updated`);
      return {
        success: true,
        message: `Currency rates updated successfully. ${createdCount} created, ${updatedCount} updated.`,
        date: conversionDate,
        totalRates: Object.keys(rates).length,
      };
    } catch (error: any) {
      console.error("Failed to update currency rates:", error.message);
      if (error.response) {
        console.error("API Response:", error.response.status, error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update currency rates",
      };
    }
  }

  convert(amountGhs: number, targetCurrency: string, rate: number): number {
    if (targetCurrency === this.baseCurrency) {
      return amountGhs;
    }
    return Number((amountGhs * rate).toFixed(2));
  }
}

