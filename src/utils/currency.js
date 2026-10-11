/**
 * Currency and Number Formatting Utilities
 * Uses Indian numbering system (Lakhs and Crores) and INR currency symbol (₹)
 */

/**
 * Format a number as Indian Rupee (INR) currency with two decimal places.
 * Example: 125000 -> ₹1,25,000.00
 * @param {number|string} amount
 * @returns {string}
 */
export function formatINR(amount) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return '₹0.00';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (e) {
    // Fallback if Intl format fails
    return `₹${numericAmount.toFixed(2)}`;
  }
}

/**
 * Format a number as Indian Rupee with optional symbol or for compact display
 * @param {number|string} amount
 * @returns {string}
 */
export function formatINRCompact(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return formatINR(num);
}

/**
 * Format a percentage value safely to two decimal places.
 * Handles division by zero gracefully.
 * @param {number|string} percent
 * @returns {string}
 */
export function formatPercentage(percent) {
  const numeric = Number(percent);
  if (isNaN(numeric) || !isFinite(numeric)) {
    return '0.00%';
  }
  return `${numeric.toFixed(2)}%`;
}

/**
 * Format an integer with Indian comma grouping.
 * Example: 10000 -> 10,000
 * @param {number|string} count
 * @returns {string}
 */
export function formatNumber(count) {
  const numeric = Number(count);
  if (isNaN(numeric)) return '0';
  return new Intl.NumberFormat('en-IN').format(numeric);
}
