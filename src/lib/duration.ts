import type { Locale } from '@/i18n/utils';

const MONTH_MAP: Record<string, number> = {
  // English
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
  // Spanish
  ene: 1,
  enero: 1,
  febr: 2,
  febrero: 2,
  mzo: 3,
  marzo: 3,
  abr: 4,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  ago: 8,
  agosto: 8,
  sept: 9,
  set: 9,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  dic: 12,
  diciembre: 12,
};

interface YearMonth {
  year: number;
  month: number;
}

/**
 * Parses date strings such as:
 * - ISO: '2025-05', '2025-05-15', '2025'
 * - Human: 'May 2025', 'Sep 2025', 'Mayo 2025', 'Noviembre 2021'
 */
function parseYearMonth(input?: string): YearMonth | null {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // 1. Check ISO format (YYYY-MM or YYYY-MM-DD or YYYY)
  const isoMatch = trimmed.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (isoMatch) {
    const year = Number.parseInt(isoMatch[1], 10);
    const month = isoMatch[2] ? Number.parseInt(isoMatch[2], 10) : 1;
    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  // 2. Check "Month Year" format (e.g. "May 2025", "Mayo 2025", "Nov 2021")
  const words = trimmed.split(/[\s,.-]+/);
  if (words.length >= 2) {
    let year: number | null = null;
    let month: number | null = null;

    for (const part of words) {
      if (/^\d{4}$/.test(part)) {
        year = Number.parseInt(part, 10);
      } else if (MONTH_MAP[part]) {
        month = MONTH_MAP[part];
      }
    }

    if (year !== null && month !== null) {
      return { year, month };
    }
  }

  return null;
}

/**
 * Calculates total inclusive months between two dates and formats as a localized duration string.
 * Supports ongoing roles if end is undefined, empty, 'Present', or 'Presente'.
 */
export function calculateDuration(
  startInput: string,
  endInput?: string,
  locale: Locale = 'en',
  now: Date = new Date(),
): string {
  const start = parseYearMonth(startInput);
  if (!start) return '';

  let end: YearMonth | null = null;
  const trimmedEnd = endInput?.trim().toLowerCase();

  if (!trimmedEnd || trimmedEnd === 'present' || trimmedEnd === 'presente') {
    end = {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
    };
  } else {
    end = parseYearMonth(endInput);
  }

  if (!end) return '';

  const totalMonths =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;
  if (totalMonths <= 0) return '';

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years === 0) {
    if (locale === 'es') {
      return totalMonths === 1 ? '1 mes' : `${totalMonths} meses`;
    }
    return totalMonths === 1 ? '1 month' : `${totalMonths} months`;
  }

  if (remainingMonths === 0) {
    if (locale === 'es') {
      return years === 1 ? '1 año' : `${years} años`;
    }
    return years === 1 ? '1 yr' : `${years} yrs`;
  }

  // Years + remaining months
  if (locale === 'es') {
    const yrStr = years === 1 ? '1 año' : `${years} años`;
    const moStr = remainingMonths === 1 ? '1 mes' : `${remainingMonths} meses`;
    return `${yrStr} ${moStr}`;
  }

  const yrStr = years === 1 ? '1 yr' : `${years} yrs`;
  const moStr = remainingMonths === 1 ? '1 mo' : `${remainingMonths} mos`;
  return `${yrStr} ${moStr}`;
}
