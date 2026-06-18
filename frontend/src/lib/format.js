export const currency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value || 0)
  );

export const dateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Classify a stock level into a domain status used by the stock meter + badges.
export function stockStatus(qty, threshold = 10) {
  if (qty <= 0) return "out";
  if (qty <= threshold) return "low";
  return "ok";
}
