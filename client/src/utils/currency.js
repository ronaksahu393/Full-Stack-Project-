/**
 * HotelPro Currency Formatter
 * Compliant with Indian Numbering System and Currency Standard
 * Outputs format: ₹1,499, ₹3,250, ₹12,000, etc.
 */

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

export function formatCurrency(amount, currency = "INR") {
  if (currency === "USD") {
    return `$${Math.round(amount || 0)}`;
  }
  return formatINR(amount);
}
