import { describe, expect, it } from 'vitest';
import { calculateDuration } from './duration';

describe('calculateDuration', () => {
  const fixedNow = new Date('2026-10-16T12:00:00Z');

  describe('Standard ISO ranges (YYYY-MM)', () => {
    it('calculates duration for Ultranic role (2025-05 to 2025-09)', () => {
      expect(calculateDuration('2025-05', '2025-09', 'en')).toBe('5 months');
      expect(calculateDuration('2025-05', '2025-09', 'es')).toBe('5 meses');
    });

    it('calculates duration for Clínica Nancurunaisa role (2021-11 to 2023-06)', () => {
      expect(calculateDuration('2021-11', '2023-06', 'en')).toBe('1 yr 8 mos');
      expect(calculateDuration('2021-11', '2023-06', 'es')).toBe(
        '1 año 8 meses',
      );
    });

    it('calculates single-month durations (same start and end month)', () => {
      expect(calculateDuration('2025-05', '2025-05', 'en')).toBe('1 month');
      expect(calculateDuration('2025-05', '2025-05', 'es')).toBe('1 mes');
    });

    it('calculates exact 1-year duration', () => {
      expect(calculateDuration('2024-01', '2024-12', 'en')).toBe('1 yr');
      expect(calculateDuration('2024-01', '2024-12', 'es')).toBe('1 año');
    });

    it('calculates exact multi-year duration', () => {
      expect(calculateDuration('2022-01', '2023-12', 'en')).toBe('2 yrs');
      expect(calculateDuration('2022-01', '2023-12', 'es')).toBe('2 años');
    });

    it('calculates 1 year with 1 month remainder', () => {
      expect(calculateDuration('2024-01', '2025-01', 'en')).toBe('1 yr 1 mo');
      expect(calculateDuration('2024-01', '2025-01', 'es')).toBe('1 año 1 mes');
    });
  });

  describe('Ongoing / Present durations', () => {
    it('calculates duration when end is undefined using reference now date', () => {
      // Nov 2025 to Oct 2026 inclusive: (2026 - 2025)*12 + (10 - 11) + 1 = 12 months = 1 yr
      expect(calculateDuration('2025-11', undefined, 'en', fixedNow)).toBe(
        '1 yr',
      );
      expect(calculateDuration('2025-11', undefined, 'es', fixedNow)).toBe(
        '1 año',
      );
    });

    it('calculates duration when end is "Present" (case-insensitive)', () => {
      expect(calculateDuration('2025-11', 'Present', 'en', fixedNow)).toBe(
        '1 yr',
      );
      expect(calculateDuration('2025-11', 'present', 'es', fixedNow)).toBe(
        '1 año',
      );
    });

    it('calculates duration when end is "Presente" (case-insensitive)', () => {
      expect(calculateDuration('2025-11', 'Presente', 'en', fixedNow)).toBe(
        '1 yr',
      );
      expect(calculateDuration('2025-11', 'presente', 'es', fixedNow)).toBe(
        '1 año',
      );
    });

    it('calculates duration when end is empty string', () => {
      expect(calculateDuration('2025-11', '', 'en', fixedNow)).toBe('1 yr');
    });
  });

  describe('Human-readable month strings', () => {
    it('parses English month names like "May 2025" and "Sep 2025"', () => {
      expect(calculateDuration('May 2025', 'Sep 2025', 'en')).toBe('5 months');
      expect(calculateDuration('May 2025', 'September 2025', 'en')).toBe(
        '5 months',
      );
    });

    it('parses Spanish month names like "Mayo 2025" and "Sep 2025"', () => {
      expect(calculateDuration('Mayo 2025', 'Sep 2025', 'es')).toBe('5 meses');
      expect(calculateDuration('Noviembre 2021', 'Junio 2023', 'es')).toBe(
        '1 año 8 meses',
      );
      expect(calculateDuration('Nov 2021', 'Jun 2023', 'es')).toBe(
        '1 año 8 meses',
      );
    });

    it('parses "Nov 2025" to "Present" with reference now date', () => {
      expect(calculateDuration('Nov 2025', 'Present', 'en', fixedNow)).toBe(
        '1 yr',
      );
      expect(calculateDuration('Nov 2025', 'Presente', 'es', fixedNow)).toBe(
        '1 año',
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('returns empty string if end date is before start date', () => {
      expect(calculateDuration('2025-09', '2025-05', 'en')).toBe('');
      expect(calculateDuration('2025-09', '2025-05', 'es')).toBe('');
    });

    it('returns empty string on unparseable / invalid dates', () => {
      expect(calculateDuration('invalid-date', '2025-09', 'en')).toBe('');
      expect(calculateDuration('2025-05', 'invalid-date', 'en')).toBe('');
      expect(calculateDuration('', '', 'en')).toBe('');
    });
  });
});
