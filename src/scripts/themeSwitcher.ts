import {
  isTheme,
  resolveTheme,
  STORAGE_KEY,
  type Theme,
  toColorScheme,
  toDataTheme,
} from '@/lib/theme';

const COLOR_SCHEME_META = 'meta[name="color-scheme"]';
const THEME_OPTION = '[data-theme-option]';
const THEME_TRIGGER = '[data-theme-trigger]';
const THEME_MENU = '[role="menu"]';
const POPOVER = '[popover]';
const ACTIVE_CLASS = 'is-active';
const ARIA_CHECKED = 'aria-checked';
const DATA_THEME = 'data-theme';
const DATA_ACTIVE_THEME = 'data-active-theme';

/** Cache the meta element per document to avoid querySelector on every apply. */
const metaCache = new WeakMap<Document, HTMLMetaElement>();

/**
 * Applies the given theme to the document.
 */
export function applyTheme(theme: Theme, doc: Document = document): void {
  const root = doc.documentElement;
  const colorScheme = toColorScheme(theme);

  // 1. Update meta[name="color-scheme"] (cache + skip if already correct).
  let meta = metaCache.get(doc);
  if (!meta || meta.isConnected === false) {
    meta = doc.querySelector<HTMLMetaElement>(COLOR_SCHEME_META) ?? undefined;

    if (!meta) {
      meta = doc.createElement('meta');
      meta.name = 'color-scheme';
      doc.head.appendChild(meta);
    }

    metaCache.set(doc, meta);
  }

  if (meta.content !== colorScheme) {
    meta.content = colorScheme;
  }

  // 2. Set or remove data-theme.
  //    removeAttribute is a cheap no-op on real DOM when absent, and it
  //    avoids relying on hasAttribute (which mock DOMs may not implement).
  const dataTheme = toDataTheme(theme);
  if (dataTheme) {
    root.setAttribute(DATA_THEME, dataTheme);
  } else {
    root.removeAttribute(DATA_THEME);
  }

  // 3. Current theme marker.
  root.setAttribute(DATA_ACTIVE_THEME, theme);

  // 4. Menu radio state.
  const options = doc.querySelectorAll<HTMLButtonElement>(THEME_OPTION);
  const optionCount = options.length;

  if (optionCount === 0) return;

  for (let i = 0; i < optionCount; i++) {
    const option = options[i];
    const isSelected = option.dataset.themeOption === theme;

    // Always write aria-checked (parity with original behaviour, and mocks
    // do not emulate attribute state so skipping would suppress the call).
    option.setAttribute(ARIA_CHECKED, isSelected ? 'true' : 'false');

    if (isSelected) {
      option.classList.add(ACTIVE_CLASS);
    } else {
      option.classList.remove(ACTIVE_CLASS);
    }
  }
}

/**
 * Persists theme preference to storage.
 * 'system' preference removes the stored key so OS changes take precedence.
 * Exceptions (e.g. SecurityError, QuotaExceeded) are caught gracefully.
 */
export function persistTheme(
  theme: Theme,
  storage: Storage = window.localStorage,
): void {
  try {
    if (theme === 'system') {
      storage.removeItem(STORAGE_KEY);
      return;
    }

    storage.setItem(STORAGE_KEY, theme);
  } catch (_) {
    // Graceful fallback when storage is inaccessible
  }
}

/**
 * Initializes interactive listeners for the theme switcher popover menu:
 * - Click handling on theme items
 * - Keyboard arrow navigation in menu
 * - Multi-tab storage sync
 */
export function initThemeSwitcher(
  doc: Document = document,
  storage: Storage = typeof window !== 'undefined'
    ? window.localStorage
    : ({} as Storage),
): () => void {
  const hasWindow = typeof window !== 'undefined';

  // Initial sync: keep this in try/catch because storage access can throw.
  try {
    const storedVal =
      typeof storage?.getItem === 'function'
        ? storage.getItem(STORAGE_KEY)
        : null;

    applyTheme(resolveTheme(storedVal), doc);
  } catch (_) {
    // Graceful fallback if storage is inaccessible
  }

  const handleClick = (event: MouseEvent) => {
    const target = (event.target as Element | null)?.closest<HTMLButtonElement>(
      THEME_OPTION,
    );

    if (!target) return;

    const chosenTheme = target.dataset.themeOption;
    if (!isTheme(chosenTheme)) return;

    applyTheme(chosenTheme, doc);
    persistTheme(chosenTheme, storage);

    const popover = target.closest<HTMLElement>(POPOVER);
    if (popover && typeof popover.hidePopover === 'function') {
      try {
        popover.hidePopover();
      } catch (_) {
        // Popover might already be closing
      }
    }

    doc.querySelector<HTMLButtonElement>(THEME_TRIGGER)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const activeEl = doc.activeElement as HTMLElement | null;

    if (!activeEl?.matches(THEME_OPTION)) return;

    const menu = activeEl.closest(THEME_MENU);
    if (!menu) return;

    const items = menu.querySelectorAll<HTMLButtonElement>(THEME_OPTION);
    const len = items.length;

    if (len === 0) return;

    const currentIndex = Array.prototype.indexOf.call(items, activeEl);
    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % len;
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + len) % len;
        break;

      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        nextIndex = len - 1;
        break;

      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      items[nextIndex]?.focus();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;

    applyTheme(resolveTheme(event.newValue), doc);
  };

  doc.addEventListener('click', handleClick);
  doc.addEventListener('keydown', handleKeyDown);

  if (hasWindow) {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    doc.removeEventListener('click', handleClick);
    doc.removeEventListener('keydown', handleKeyDown);

    if (hasWindow) {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

// Auto-run in browser environment
if (typeof window !== 'undefined') {
  initThemeSwitcher();
}
