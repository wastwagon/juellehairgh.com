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
    // Using exchangerate-api.com - Free tier supports 170+ currencies
    // Alternative: You can use fixer.io, openexchangerates.org, or currencyapi.net
    const apiKey = this.configService.get<string>("CURRENCY_API_KEY");
    
    // If no API key, use a free public API as fallback
    if (!apiKey) {
      console.warn("CURRENCY_API_KEY not set. Using free public API (exchangerate-api.com)");
      // exchangerate-api.com free tier doesn't require API key for basic usage
      const apiUrl = `https://v6.exchangerate-api.com/v6/latest/${this.baseCurrency}`;
      return this.fetchAndStoreRates(apiUrl);
    }

    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${this.baseCurrency}`;
    return this.fetchAndStoreRates(apiUrl);
  }

  private async fetchAndStoreRates(apiUrl: string) {
    try {
      console.log(`Fetching currency rates from: ${apiUrl.replace(/\/v6\/[^/]+\//, '/v6/***/')}`);
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          "User-Agent": "JuelleHair-Ecommerce/1.0",
        },
      });

      if (!response.data || !response.data.rates) {
        throw new Error("Invalid API response: rates not found");
      }

      const rates = response.data.rates;
      const conversionDate = response.data.date || new Date().toISOString().split("T")[0];
      
      console.log(`Received rates for ${Object.keys(rates).length} currencies`);

      // Get all currency codes we want to support
      const supportedCurrencyCodes = ALL_CURRENCIES.map((c) => c.code);
      
      let updatedCount = 0;
      let createdCount = 0;

      // Store all available rates
      for (const [currencyCode, rate] of Object.entries(rates)) {
        // Only store rates for currencies we support
        if (supportedCurrencyCodes.includes(currencyCode) && typeof rate === "number") {
          const result = await this.prisma.currencyRate.upsert({
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

          if (result) {
            // Check if it was created or updated by checking if it was just created
            const existing = await this.prisma.currencyRate.findUnique({
              where: {
                baseCurrency_targetCurrency: {
                  baseCurrency: this.baseCurrency,
                  targetCurrency: currencyCode,
                },
              },
            });
            if (existing && existing.updatedAt.getTime() === new Date().getTime()) {
              createdCount++;
            } else {
              updatedCount++;
            }
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

