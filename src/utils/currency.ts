function toNumber(price: number | string | null | undefined): number {
  if (price === null || price === undefined) return 0;
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function formatPrice(price: number | string, isRent = false): string {
  const p = toNumber(price);
  if (isRent) {
    return `Rs. ${Math.round(p).toLocaleString('en-US')}/mo`;
  }
  if (p >= 10000000) {
    return `Rs. ${trimDecimal(p / 10000000)} Crore`;
  }
  if (p >= 100000) {
    return `Rs. ${trimDecimal(p / 100000)} Lac`;
  }
  return `Rs. ${Math.round(p).toLocaleString('en-US')}`;
}

export function formatMarkerPrice(price: number | string, isRent = false): string {
  const p = toNumber(price);
  if (isRent && p >= 1000) {
    return `${trimDecimal(p / 1000)}K`;
  }
  if (p >= 10000000) {
    return `${trimDecimal(p / 10000000)} Cr`;
  }
  if (p >= 100000) {
    return `${trimDecimal(p / 100000)} Lac`;
  }
  return `${Math.round(p / 1000)}K`;
}

function trimDecimal(value: number): string {
  return Number(value.toFixed(1)).toString();
}
