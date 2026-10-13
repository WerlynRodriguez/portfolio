import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  getTranslator,
  isValidLocale,
  LOCALES,
  resolveLocale,
  useTranslations,
} from './utils';

describe('i18n utils', () => {
  it('defines supported locales and default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(LOCALES).toEqual(['en', 'es']);
  });

  describe('resolveLocale & isValidLocale', () => {
    it('validates supported locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('es')).toBe(true);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale(undefined)).toBe(false);
    });

    it('resolves valid locales and falls back to DEFAULT_LOCALE for invalid ones', () => {
      expect(resolveLocale('en')).toBe('en');
      expect(resolveLocale('es')).toBe('es');
      expect(resolveLocale('de')).toBe('en');
      expect(resolveLocale(undefined)).toBe('en');
    });
  });

  describe('useTranslations / getTranslator', () => {
    it('retrieves common namespace translations by default', () => {
      const tEn = useTranslations('en');
      expect(tEn('nav.overview')).toBe('Overview');
      expect(tEn('meta.title')).toBe('Werlyn - Software Developer');

      const tEs = useTranslations('es');
      expect(tEs('nav.overview')).toBe('Resumen');
      expect(tEs('meta.title')).toBe('Werlyn - Desarrollador de Software');
    });

    it('retrieves scoped translations for a specific namespace', () => {
      const tHeroEn = useTranslations('en', 'hero');
      expect(tHeroEn('title')).toBe('Werlyn');
      expect(tHeroEn('cta.projects')).toBe('View Projects');

      const tHeroEs = useTranslations('es', 'hero');
      expect(tHeroEs('title')).toBe('Werlyn');
      expect(tHeroEs('cta.projects')).toBe('Ver Proyectos');
    });

    it('interpolates parameters when provided', () => {
      const t = useTranslations('en', 'common');
      expect(t('nav.overview', { unused: 'value' })).toBe('Overview');
    });

    it('exposes getTranslator as an alias to useTranslations', () => {
      expect(getTranslator).toBe(useTranslations);
    });
  });
});
