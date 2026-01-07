/**
 * Shipping time utilities for Ghana timezone
 * Orders before 2PM Ghana time → Ships Today
 * Orders after 2PM Ghana time → Ships Next Day
 */

/**
 * Get current time in Ghana (GMT/UTC+0)
 */
export function getGhanaTime(): Date {
  // Ghana is in GMT/UTC+0 timezone (Africa/Accra)
  const now = new Date();
  // Get Ghana time components
  const ghanaTimeString = now.toLocaleString("en-US", { 
    timeZone: "Africa/Accra",
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Parse: "MM/DD/YYYY, HH:MM:SS"
  const [datePart, timePart] = ghanaTimeString.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  // Create new Date in UTC (Ghana time is UTC+0)
  return new Date(Date.UTC(
    parseInt(year), 
    parseInt(month) - 1, 
    parseInt(day), 
    parseInt(hours), 
    parseInt(minutes), 
    parseInt(seconds)
  ));
}

/**
 * Check if current time is before 2PM Ghana time
 */
export function isBeforeCutoff(): boolean {
  const ghanaTime = getGhanaTime();
  const hours = ghanaTime.getHours();
  return hours < 14; // 2PM = 14:00
}

/**
 * Get shipping status text
 * @returns "Ship Today" if before 2PM, "Ships Next Day" if after 2PM
 */
export function getShippingStatus(): "Ship Today" | "Ships Next Day" {
  return isBeforeCutoff() ? "Ship Today" : "Ships Next Day";
}

/**
 * Get shipping message with cut-off time
 */
export function getShippingMessage(): string {
  const status = getShippingStatus();
  const ghanaTime = getGhanaTime();
  const hours = ghanaTime.getHours();
  const minutes = ghanaTime.getMinutes();
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  if (status === "Ship Today") {
    return `Order ${status} Item(s) by 2PM GMT — Ships Today!`;
  } else {
    return `Orders Placed After 2PM GMT Ship Next Business Day.`;
  }
}

/**
 * Get full shipping banner text
 */
export function getShippingBannerText(): string {
  const status = getShippingStatus();
  const ghanaTime = getGhanaTime();
  const hours = ghanaTime.getHours();
  const minutes = ghanaTime.getMinutes();
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  if (status === "Ship Today") {
    return `Order ${status} Item(s) by 2PM GMT — Ships Today!`;
  } else {
    return `Orders Placed After 2PM GMT Ship Next Business Day.`;
  }
}

