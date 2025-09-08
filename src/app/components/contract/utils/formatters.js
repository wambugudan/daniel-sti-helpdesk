// File: src/app/components/contract/utils/formatters.js
export const formatCurrency = (amount) =>
  amount ? `$${amount.toLocaleString()}` : "-";

export const formatDateTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Invalid date";
  }
};
