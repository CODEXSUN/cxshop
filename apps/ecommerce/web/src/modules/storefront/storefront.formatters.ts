export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export function hasStorefrontPrice(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function whatsappLink(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
