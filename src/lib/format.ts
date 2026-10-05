const numberFmt = new Intl.NumberFormat("ar-EG");

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

/** `null` = price not supplied (no product has one today; never shown as "soon"). */
export function formatPrice(value: number | null): string {
  return value === null ? "اسأل على السعر" : `${numberFmt.format(value)} ج.م`;
}

/** Hotline in Arabic-Indic digits for display (keep the raw value for tel: links). */
export function formatPhone(value: string): string {
  return value.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

/** "صنف" / "صنفين" / "٣ أصناف" / "١١ صنف" — Arabic plural agreement. */
export function itemsLabel(count: number): string {
  if (count === 1) return "صنف واحد";
  if (count === 2) return "صنفين";
  if (count >= 3 && count <= 10) return `${formatNumber(count)} أصناف`;
  return `${formatNumber(count)} صنف`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
