import {
  isTheme,
  resolveTheme,
  STORAGE_KEY,
  type Theme,
  toColorScheme,
  toDataTheme,
} from '@/lib/theme';

/**
 * Applies the given theme to the document:
 * 1. Updates meta[name="color-scheme"] content.
 * 2. Sets or removes data-theme="eclipse" on <html>.
 * 3. Updates aria-checked on theme radio options in the menu.
 * 4. Updates data-current-theme on the switcher container/trigger.
 */
export function applyTheme(theme: Theme, doc: Document = document): void {
  const root = doc.documentElement;

  // 1. Update meta[name="color-scheme"]
  let meta = doc.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (!meta) {
    meta = doc.createElement('meta');
    meta.name = 'color-scheme';
    doc.head.appendChild(meta);
  }
  meta.content = toColorScheme(theme);

  // 2. Set or remove data-theme
  const dataTheme = toDataTheme(theme);
  if (dataTheme) {
    root.setAttribute('data-theme', dataTheme);
  } else {
    root.removeAttribute('data-theme');
  }

  // 3. Update current theme marker on root and trigger
  root.setAttribute('data-active-theme', theme);

  // 4. Update aria-checked and active classes on menu items
  const options = doc.querySelectorAll<HTMLButtonElement>(
    '[data-theme-option]',
  );
  for (const option of options) {
    const isSelected = option.dataset.themeOption === theme;
    option.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    if (isSelected) {
      option.classList.add('is-active');
    } else {
      option.classList.remove('is-active');
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
    } else {
      storage.setItem(STORAGE_KEY, theme);
    }
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
  // Sync menu radio state and document with stored theme on initialization
  try {
    const storedVal =
      typeof storage?.getItem === 'function'
        ? storage.getItem(STORAGE_KEY)
        : null;
    const initialTheme = resolveTheme(storedVal);
    applyTheme(initialTheme, doc);
  } catch (_) {
    // Graceful fallback if storage is inaccessible
  }

  const handleClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement)?.closest<HTMLButtonElement>(
      '[data-theme-option]',
    );
    if (!target) return;

    const chosenTheme = target.dataset.themeOption;
    if (!isTheme(chosenTheme)) return;

    applyTheme(chosenTheme, doc);
    persistTheme(chosenTheme, storage);

    // Close popover if supported
    const popover = target.closest<HTMLElement>('[popover]');
    if (popover && typeof popover.hidePopover === 'function') {
      try {
        popover.hidePopover();
      } catch (_) {
        // Popover might already be closing
      }
    }

    // Return focus to trigger button
    const trigger = doc.querySelector<HTMLButtonElement>(
      '[data-theme-trigger]',
    );
    trigger?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const activeEl = doc.activeElement as HTMLElement | null;
    if (!activeEl?.matches('[data-theme-option]')) return;

    const menu = activeEl.closest('[role="menu"]');
    if (!menu) return;

    const items = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('[data-theme-option]'),
    );
    const currentIndex = items.indexOf(activeEl as HTMLButtonElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = items.length - 1;
    }

    if (nextIndex !== currentIndex) {
      items[nextIndex]?.focus();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const updatedTheme = resolveTheme(event.newValue);
      applyTheme(updatedTheme, doc);
    }
  };

  doc.addEventListener('click', handleClick);
  doc.addEventListener('keydown', handleKeyDown);

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    doc.removeEventListener('click', handleClick);
    doc.removeEventListener('keydown', handleKeyDown);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

// Auto-run in browser environment
if (typeof window !== 'undefined') {
  initThemeSwitcher();
}
