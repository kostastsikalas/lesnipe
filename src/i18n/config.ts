export const locales = ["el", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "el";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Picks a field in the current locale from a { el, en } pair. */
export type Localized<T = string> = Record<Locale, T>;
