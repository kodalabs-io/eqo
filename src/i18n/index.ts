import type { SupportedLocale } from "../types.js";
import type { Translations } from "./types.js";

// Lazy-loaded locale map — add new locales here
const localeLoaders: Record<string, () => Promise<{ default: Translations }>> = {
  "en-US": () => import("./en-US.js"),
  "fr-FR": () => import("./fr-FR.js"),
};

const cache = new Map<string, Translations>();

/**
 * Load translations for the given locale.
 * Falls back to "en-US" if the locale is not found.
 */
export async function loadTranslations(locale: SupportedLocale): Promise<Translations> {
  if (cache.has(locale)) {
    return cache.get(locale) as Translations;
  }

  const loader = localeLoaders[locale] ?? localeLoaders["en-US"];

  if (!loader) {
    throw new Error(`[eqo] No translation loader found for locale "${locale}"`);
  }

  const mod = await loader();
  cache.set(locale, mod.default);
  return mod.default;
}

/**
 * Synchronously get cached translations.
 * Must call loadTranslations() first.
 */
export function getTranslations(locale: SupportedLocale): Translations {
  const t = cache.get(locale) ?? cache.get("en-US");
  if (!t) {
    throw new Error(`[eqo] Translations not loaded. Call loadTranslations("${locale}") first.`);
  }
  return t;
}

/**
 * Interpolate a translation string with named placeholders.
 *
 * @example
 * interpolate("Hello {name}!", { name: "World" }) // → "Hello World!"
 */
export function interpolate(template: string, context?: Record<string, string>): string {
  if (!context) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => context[key] ?? `{${key}}`);
}

/**
 * Returns the list of supported locales.
 */
export function getSupportedLocales(): SupportedLocale[] {
  return Object.keys(localeLoaders) as SupportedLocale[];
}

export type { Translations } from "./types.js";
