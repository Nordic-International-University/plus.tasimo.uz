/** className'larni birlashtirish (falsy qiymatlar tashlanadi) */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}
