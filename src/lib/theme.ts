/**
 * Available theme modes.
 */
export const THEMES = ['system', 'light', 'dark', 'eclipse'] as const;

/**
 * Union type representing all valid theme options.
 */
export type Theme = (typeof THEMES)[number];

/**
 * Key used to store theme preference in localStorage.
 */
export const STORAGE_KEY = 'theme' as const;

/**
 * Default fallback theme (delegates to system preference).
 */
export const DEFAULT_THEME: Theme = 'system';

/**
 * Type guard to check if an arbitrary value is a recognized Theme.
 */
export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === 'string' && (THEMES as readonly string[]).includes(value)
  );
}

/**
 * Resolves a stored theme string to a valid Theme, falling back to DEFAULT_THEME.
 */
export function resolveTheme(stored: string | null | undefined): Theme {
  if (stored && isTheme(stored)) {
    return stored;
  }
  return DEFAULT_THEME;
}

/**
 * Maps a theme to the standard CSS `color-scheme` value for meta[name="color-scheme"].
 * Eclipse uses 'light' at the document level with component-level dark overrides.
 */
export function toColorScheme(theme: Theme): 'light dark' | 'light' | 'dark' {
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'eclipse':
      return 'light';
    default:
      return 'light dark';
  }
}

/**
 * Maps a theme to data-theme attribute value on the root HTML element.
 * Only 'eclipse' requires data-theme="eclipse"; standard light/dark/system rely purely on color-scheme.
 */
export function toDataTheme(theme: Theme): 'eclipse' | null {
  return theme === 'eclipse' ? 'eclipse' : null;
}
