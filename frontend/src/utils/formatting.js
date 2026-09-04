export function formatCurrency(value) {
  if (value === undefined || value === null) return '₹0';
  
  // Use Indian number format without decimals for whole numbers
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

export function formatPercentage(value, isDecimal = false) {
  if (value === undefined || value === null) return '0%';
  
  // If isDecimal is true, assume it's like 0.40 -> 40%.
  // If false, assume it's like 40 -> 40%.
  const decimalVal = isDecimal ? value : value / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(decimalVal);
}
