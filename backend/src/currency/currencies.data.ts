// Comprehensive list of all world currencies with their symbols and country flags
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string; // Country code for flag emoji or image
  country: string;
}

export const ALL_CURRENCIES: CurrencyInfo[] = [
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", country: "Ghana" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", country: "European Union" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", country: "Nigeria" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺", country: "Australia" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$", flag: "🇳🇿", country: "New Zealand" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", country: "Japan" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", country: "China" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", country: "India" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", country: "South Africa" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", country: "Kenya" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", country: "Uganda" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", country: "Tanzania" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", country: "Ethiopia" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", flag: "🇪🇬", country: "Egypt" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", flag: "🇲🇦", country: "Morocco" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", country: "United Arab Emirates" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱", country: "Israel" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", country: "Turkey" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", country: "Russia" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", country: "Brazil" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽", country: "Mexico" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", flag: "🇦🇷", country: "Argentina" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", flag: "🇨🇱", country: "Chile" },
  { code: "COP", name: "Colombian Peso", symbol: "$", flag: "🇨🇴", country: "Colombia" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", flag: "🇵🇪", country: "Peru" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", country: "South Korea" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", flag: "🇸🇬", country: "Singapore" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", country: "Malaysia" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", country: "Thailand" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", country: "Indonesia" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", country: "Philippines" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", country: "Vietnam" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰", country: "Hong Kong" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", country: "Taiwan" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", country: "Switzerland" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", country: "Norway" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", country: "Sweden" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", country: "Denmark" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", country: "Poland" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", country: "Czech Republic" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", country: "Hungary" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", country: "Romania" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", country: "Bulgaria" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", flag: "🇭🇷", country: "Croatia" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин", flag: "🇷🇸", country: "Serbia" },
  { code: "BAM", name: "Bosnia-Herzegovina Mark", symbol: "KM", flag: "🇧🇦", country: "Bosnia and Herzegovina" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден", flag: "🇲🇰", country: "North Macedonia" },
  { code: "ALL", name: "Albanian Lek", symbol: "L", flag: "🇦🇱", country: "Albania" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr", flag: "🇮🇸", country: "Iceland" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", flag: "🌍", country: "West Africa" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", flag: "🌍", country: "Central Africa" },
  { code: "XPF", name: "CFP Franc", symbol: "₣", flag: "🇵🇫", country: "French Pacific" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "$", flag: "🇯🇲", country: "Jamaica" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "$", flag: "🇧🇧", country: "Barbados" },
  { code: "BZD", name: "Belize Dollar", symbol: "$", flag: "🇧🇿", country: "Belize" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "$", flag: "🇧🇲", country: "Bermuda" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "$", flag: "🇧🇸", country: "Bahamas" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "$", flag: "🇰🇾", country: "Cayman Islands" },
  { code: "TTD", name: "Trinidad and Tobago Dollar", symbol: "$", flag: "🇹🇹", country: "Trinidad and Tobago" },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼", country: "Botswana" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲", country: "Zambia" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼", country: "Malawi" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", country: "Mozambique" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", flag: "🇦🇴", country: "Angola" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar", flag: "🇲🇬", country: "Madagascar" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨", flag: "🇲🇺", country: "Mauritius" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨", flag: "🇸🇨", country: "Seychelles" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "₨", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", country: "Bangladesh" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", country: "Pakistan" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", flag: "🇦🇫", country: "Afghanistan" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", flag: "🇮🇷", country: "Iran" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", flag: "🇮🇶", country: "Iraq" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", flag: "🇯🇴", country: "Jordan" },
  { code: "LBP", name: "Lebanese Pound", symbol: "£", flag: "🇱🇧", country: "Lebanon" },
  { code: "SYP", name: "Syrian Pound", symbol: "£", flag: "🇸🇾", country: "Syria" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼", flag: "🇾🇪", country: "Yemen" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع.", flag: "🇴🇲", country: "Oman" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", country: "Kuwait" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب", flag: "🇧🇭", country: "Bahrain" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", flag: "🇶🇦", country: "Qatar" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", flag: "🇰🇿", country: "Kazakhstan" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm", flag: "🇺🇿", country: "Uzbekistan" },
  { code: "KGS", name: "Kyrgystani Som", symbol: "с", flag: "🇰🇬", country: "Kyrgyzstan" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ", flag: "🇹🇯", country: "Tajikistan" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "T", flag: "🇹🇲", country: "Turkmenistan" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", flag: "🇦🇿", country: "Azerbaijan" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏", flag: "🇦🇲", country: "Armenia" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾", flag: "🇬🇪", country: "Georgia" },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br", flag: "🇧🇾", country: "Belarus" },
  { code: "MDL", name: "Moldovan Leu", symbol: "L", flag: "🇲🇩", country: "Moldova" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", flag: "🇺🇦", country: "Ukraine" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", country: "Bulgaria" },
];

// Get currency by code
export function getCurrencyByCode(code: string): CurrencyInfo | undefined {
  return ALL_CURRENCIES.find((c) => c.code === code);
}

// Get popular currencies (most commonly used)
export const POPULAR_CURRENCIES = [
  "GHS", "USD", "EUR", "GBP", "NGN", "CAD", "AUD", "NZD", "JPY", "CNY", "INR", "ZAR", "KES", "AED", "SAR"
];





