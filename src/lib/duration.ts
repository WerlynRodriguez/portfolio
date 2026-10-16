import type { Locale } from '@/i18n/utils';

interface YearMonth {
  year: number;
  month: number; // 1-12
}

const MONTHS_PER_YEAR = 12;

const ISO_RE = /^(\d{4})(?:-(\d{1,2})(?:-\d{1,2})?)?(?=$|[T\s])/;
const WORD_SPLIT_RE = /[\s,.-]+/;
const YEAR_RE = /^\d{4}$/;
const PRESENT_TERMS = new Set(['present', 'presente']);

interface DurationInput {
  years?: number;
  months?: number;
}

interface IntlDurationFormat {
  format(duration: DurationInput): string;
}

type IntlDurationFormatConstructor = new (
  locale: string,
  options?: { style?: 'long' | 'short' | 'narrow' },
) => IntlDurationFormat;

const monthMapCache = new Map<string, Map<string, number>>();
const unitFormatterCache = new Map<string, Intl.NumberFormat>();
const durationFormatterCache = new Map<string, IntlDurationFormat>();

function normalizeWord(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getMonthMap(locales: string[]): Map<string, number> {
  const key = locales.join('|');
  const cached = monthMapCache.get(key);
  if (cached) return cached;

  const map = new Map<string, number>();

  for (const locale of locales) {
    for (const monthStyle of ['long', 'short'] as const) {
      const dtf = new Intl.DateTimeFormat(locale, {
        month: monthStyle,
        timeZone: 'UTC',
      });

      for (let m = 0; m < MONTHS_PER_YEAR; m++) {
        const date = new Date(Date.UTC(2020, m, 1));
        map.set(normalizeWord(dtf.format(date)), m + 1);
      }
    }
  }

  // Aliases not always produced by Intl
  map.set('sept', 9);
  map.set('set', 9);
  map.set('sep', 9);

  monthMapCache.set(key, map);
  return map;
}

function parseYearMonth(
  input: string | undefined,
  locales: string[],
): YearMonth | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(ISO_RE);
  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10);
    const month = isoMatch[2] ? Number.parseInt(isoMatch[2], 10) : 1;

    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  const words = trimmed.toLowerCase().split(WORD_SPLIT_RE);
  if (words.length < 2) return null;

  const monthMap = getMonthMap(locales);

  let year: number | null = null;
  let month: number | null = null;

  for (const rawPart of words) {
    const part = normalizeWord(rawPart);
    if (!part) continue;

    if (YEAR_RE.test(part)) {
      year = Number.parseInt(part, 10);
    } else {
      const m = monthMap.get(part);
      if (m !== undefined) month = m;
    }
  }

  return year !== null && month !== null ? { year, month } : null;
}

function getUnitFormatter(
  locale: string,
  unit: 'year' | 'month',
): Intl.NumberFormat {
  const key = `${locale}|${unit}`;
  let fmt = unitFormatterCache.get(key);

  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'long', // use 'short' if you want "yr/mo"
    });
    unitFormatterCache.set(key, fmt);
  }

  return fmt;
}

function formatDuration(totalMonths: number, locale: string): string {
  const years = Math.floor(totalMonths / MONTHS_PER_YEAR);
  const months = totalMonths % MONTHS_PER_YEAR;

  const DurationFormat = (
    Intl as unknown as { DurationFormat?: IntlDurationFormatConstructor }
  ).DurationFormat;

  if (typeof DurationFormat === 'function') {
    const key = `${locale}|duration`;
    let df = durationFormatterCache.get(key);

    if (!df) {
      df = new DurationFormat(locale, { style: 'long' });
      durationFormatterCache.set(key, df);
    }

    const duration: DurationInput = {};
    if (years) duration.years = years;
    if (months) duration.months = months;

    return df.format(duration);
  }

  const parts: string[] = [];

  if (years) {
    parts.push(getUnitFormatter(locale, 'year').format(years));
  }

  if (months) {
    parts.push(getUnitFormatter(locale, 'month').format(months));
  }

  return parts.join(' ');
}

export function calculateDuration(
  startInput: string,
  endInput?: string,
  locale: Locale = 'en',
  now: Date = new Date(),
): string {
  const locales = [locale, 'en'];

  const start = parseYearMonth(startInput, locales);
  if (!start) return '';

  const trimmedEnd = endInput?.trim().toLowerCase();

  let end: YearMonth | null;

  if (!trimmedEnd || PRESENT_TERMS.has(trimmedEnd)) {
    end = {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
    };
  } else {
    end = parseYearMonth(endInput, locales);
  }

  if (!end) return '';

  const totalMonths =
    (end.year - start.year) * MONTHS_PER_YEAR + (end.month - start.month) + 1; // inclusive

  if (totalMonths < 1) return '';

  return formatDuration(totalMonths, locale);
}
