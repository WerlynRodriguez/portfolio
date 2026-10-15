import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  isTheme,
  resolveTheme,
  STORAGE_KEY,
  THEMES,
  toColorScheme,
  toDataTheme,
} from './theme';

describe('theme utilities (R1 / AC1, AC2)', () => {
  it('exports valid themes and storage key', () => {
    expect(THEMES).toEqual(['system', 'light', 'dark', 'bee']);
    expect(DEFAULT_THEME).toBe('system');
    expect(STORAGE_KEY).toBe('theme');
  });

  describe('isTheme', () => {
    it('validates theme values correctly', () => {
      expect(isTheme('system')).toBe(true);
      expect(isTheme('light')).toBe(true);
      expect(isTheme('dark')).toBe(true);
      expect(isTheme('bee')).toBe(true);

      expect(isTheme('invalid')).toBe(false);
      expect(isTheme(null)).toBe(false);
      expect(isTheme(undefined)).toBe(false);
      expect(isTheme(123)).toBe(false);
    });
  });

  describe('resolveTheme (AC1)', () => {
    it('returns valid themes when passed', () => {
      expect(resolveTheme('system')).toBe('system');
      expect(resolveTheme('light')).toBe('light');
      expect(resolveTheme('dark')).toBe('dark');
      expect(resolveTheme('bee')).toBe('bee');
    });

    it('falls back to DEFAULT_THEME for missing or unknown values', () => {
      expect(resolveTheme(null)).toBe('system');
      expect(resolveTheme(undefined)).toBe('system');
      expect(resolveTheme('')).toBe('system');
      expect(resolveTheme('unknown')).toBe('system');
    });
  });

  describe('toColorScheme (AC2)', () => {
    it('maps themes to standard color-scheme meta values', () => {
      expect(toColorScheme('system')).toBe('light dark');
      expect(toColorScheme('light')).toBe('light');
      expect(toColorScheme('dark')).toBe('dark');
      expect(toColorScheme('bee')).toBe('dark');
    });
  });

  describe('toDataTheme (AC2)', () => {
    it('returns "bee" only for bee theme and null otherwise', () => {
      expect(toDataTheme('bee')).toBe('bee');
      expect(toDataTheme('system')).toBeNull();
      expect(toDataTheme('light')).toBeNull();
      expect(toDataTheme('dark')).toBeNull();
    });
  });
});
