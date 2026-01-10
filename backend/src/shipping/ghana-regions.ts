/**
 * All 16 regions of Ghana
 * Updated: January 2026
 */
export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "North East",
  "Savannah",
  "Upper East",
  "Upper West",
  "Brong Ahafo",
  "Ahafo",
  "Bono",
  "Bono East",
  "Central",
] as const;

export type GhanaRegion = typeof GHANA_REGIONS[number];

/**
 * Helper function to get all regions as an array of strings
 */
export function getAllGhanaRegions(): string[] {
  return [...GHANA_REGIONS];
}

/**
 * Check if a string is a valid Ghana region
 */
export function isGhanaRegion(region: string): boolean {
  return GHANA_REGIONS.some((r) => r.toLowerCase() === region.toLowerCase());
}
