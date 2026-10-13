import {
  getAbsoluteLocaleUrl as astroGetAbsoluteLocaleUrl,
  getRelativeLocaleUrl as astroGetRelativeLocaleUrl,
} from 'astro:i18n';
import { messages } from './messages';

/** Supported locales across the application */
export const LOCALES = ['en', 'es'] as const;

/** Canonical default locale */
export const DEFAULT_LOCALE = 'en' as const;

/** Locale type union */
export type Locale = (typeof LOCALES)[number];

/** Available namespaces defined in messages dictionary */
export type Namespace = keyof typeof messages.en;

/**
 * Extracts all valid flat keys for a given namespace.
 *
 * @template N - Namespace identifier
 */
export type TranslationKey<N extends Namespace> = keyof (typeof messages.en)[N];

/**
 * Validates whether an arbitrary string is a supported application locale.
 *
 * @param candidate - The locale candidate string to check.
 * @returns `true` if candidate is a supported `Locale`, otherwise `false`.
 *
 * @example
 * ```ts
 * if (isValidLocale(Astro.currentLocale)) {
 *   // Astro.currentLocale is strictly typed as 'en' | 'es'
 * }
 * ```
 */
export function isValidLocale(
  candidate: string | undefined,
): candidate is Locale {
  return (
    typeof candidate === 'string' &&
    (LOCALES as readonly string[]).includes(candidate)
  );
}

/**
 * Resolves a locale from an arbitrary string (such as `Astro.currentLocale`).
 * Falls back to `DEFAULT_LOCALE` (`'en'`) if invalid or undefined.
 *
 * @param candidate - The candidate locale to resolve.
 * @returns A validated locale guaranteed to be supported.
 *
 * @example
 * ```ts
 * const locale = resolveLocale(Astro.currentLocale);
 * ```
 */
export function resolveLocale(candidate: string | undefined): Locale {
  return isValidLocale(candidate) ? candidate : DEFAULT_LOCALE;
}

/**
 * Standardized factory retrieving a type-safe translator function for a given locale and namespace.
 *
 * Features:
 * - Scoped to namespace: `useTranslations(lang, 'hero')` gives autocompletion for hero keys.
 * - Defaults to `'common'` namespace when omitted: `useTranslations(lang)` gives common keys.
 * - O(1) in-memory lookup.
 * - Optional parameter interpolation: replaces `{paramName}` tokens if parameters object is provided.
 *
 * @template N - The namespace to query (defaults to `'common'`)
 * @param [locale=DEFAULT_LOCALE] - Target locale. Defaults to `'en'`.
 * @param [namespace='common'] - Target namespace. Defaults to `'common'`.
 * @returns Type-safe translation function.
 *
 * @example
 * ```ts
 * // Using default 'common' namespace:
 * const t = useTranslations('en');
 * const navLabel = t('nav.start');
 * ```
 *
 * @example
 * ```ts
 * // Using a specific namespace:
 * const t = useTranslations('es', 'hero');
 * const title = t('title');
 * ```
 */
export function useTranslations<N extends Namespace = 'common'>(
  locale: Locale = DEFAULT_LOCALE,
  namespace: N = 'common' as N,
): (
  key: TranslationKey<N>,
  params?: Record<string, string | number>,
) => string {
  const dictionary =
    messages[locale]?.[namespace] ?? messages[DEFAULT_LOCALE][namespace];

  return (
    key: TranslationKey<N>,
    params?: Record<string, string | number>,
  ): string => {
    let value: string =
      (dictionary as Record<string, string>)[key as string] ??
      (messages[DEFAULT_LOCALE][namespace] as Record<string, string>)[
        key as string
      ] ??
      (key as string);

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        value = value.replaceAll(`{${paramKey}}`, String(paramVal));
      }
    }

    return value;
  };
}

/**
 * Standardized alias for `useTranslations`.
 */
export const getTranslator = useTranslations;

/**
 * Returns a relative URL path tailored to the specified locale using Astro's native i18n routing.
 *
 * @param locale - The target locale.
 * @param [path=''] - The relative path (e.g. '', 'projects', '#contact').
 * @returns The computed relative URL prefixing or preserving the path according to config.
 *
 * @example
 * ```ts
 * getRelativeLocaleUrl('es', ''); // returns '/es/'
 * getRelativeLocaleUrl('en', ''); // returns '/'
 * ```
 */
export function getRelativeLocaleUrl(locale: Locale, path = ''): string {
  return astroGetRelativeLocaleUrl(locale, path);
}

/**
 * Returns an absolute URL tailored to the specified locale using Astro's native i18n routing.
 * Requires `site` to be configured in `astro.config.mjs`.
 *
 * @param locale - The target locale.
 * @param [path=''] - The relative path.
 * @returns The computed absolute URL.
 */
export function getAbsoluteLocaleUrl(locale: Locale, path = ''): string {
  return astroGetAbsoluteLocaleUrl(locale, path);
}
