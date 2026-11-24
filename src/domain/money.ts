/**
 * Decimal money helpers. Amounts travel as decimal strings ("20500" or "20500.00")
 * and are compared in integer minor units so no floating-point rounding can
 * change an affordability outcome.
 */

const DECIMAL = /^\d{1,12}(\.\d{1,2})?$/;

export function isDecimalAmount(value: string): boolean {
  return DECIMAL.test(value);
}

/** Converts a decimal string to integer minor units (pence/kobo). Throws on invalid input. */
export function toMinorUnits(value: string): bigint {
  if (!isDecimalAmount(value)) {
    throw new Error(`Invalid decimal amount: ${value}`);
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole ?? "0") * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function formatMoney(amount: string, currency: "GBP" | "NGN"): string {
  const n = Number(amount);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}
