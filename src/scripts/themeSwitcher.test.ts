import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '@/lib/theme';
import { applyTheme, initThemeSwitcher, persistTheme } from './themeSwitcher';

type Listener = (event: unknown) => void;

interface MockElement {
  tagName: string;
  dataset: Record<string, string>;
  getAttribute: ReturnType<typeof vi.fn>;
  setAttribute: ReturnType<typeof vi.fn>;
  removeAttribute: ReturnType<typeof vi.fn>;
  classList: {
    add: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    contains: ReturnType<typeof vi.fn>;
  };
  matches: ReturnType<typeof vi.fn>;
  closest: ReturnType<typeof vi.fn>;
  focus: ReturnType<typeof vi.fn>;
  content: string;
}

interface MockPopover {
  hidePopover: ReturnType<typeof vi.fn>;
}

function createMockElement(
  tag: string,
  attrs: Record<string, string> = {},
): MockElement {
  const attributes: Record<string, string> = { ...attrs };
  const classes = new Set<string>();

  return {
    tagName: tag.toUpperCase(),
    dataset: { ...attrs },
    getAttribute: vi.fn((key: string) => attributes[key] ?? null),
    setAttribute: vi.fn((key: string, val: string) => {
      attributes[key] = String(val);
    }),
    removeAttribute: vi.fn((key: string) => {
      delete attributes[key];
    }),
    classList: {
      add: vi.fn((cls: string) => classes.add(cls)),
      remove: vi.fn((cls: string) => classes.delete(cls)),
      contains: vi.fn((cls: string) => classes.has(cls)),
    },
    matches: vi.fn((sel: string) => sel === '[data-theme-option]'),
    closest: vi.fn((sel: string) => {
      if (sel === '[data-theme-option]') return thisElement;
      if (sel === '[popover]') return mockPopover;
      if (sel === '[role="menu"]') return mockMenu;
      return null;
    }),
    focus: vi.fn(),
    content: attributes.content ?? '',
  };
}

let thisElement: MockElement | null = null;
let mockPopover: MockPopover | null = null;
let mockMenu: { querySelectorAll: ReturnType<typeof vi.fn> } | null = null;

describe('themeSwitcher client controller (R2 / AC3, AC4)', () => {
  let mockDoc: {
    documentElement: MockElement;
    activeElement: MockElement | null;
    querySelector: ReturnType<typeof vi.fn>;
    querySelectorAll: ReturnType<typeof vi.fn>;
    createElement: ReturnType<typeof vi.fn>;
    head: { appendChild: ReturnType<typeof vi.fn> };
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let mockMeta: MockElement;
  let mockRoot: MockElement;
  let mockOptions: MockElement[];
  let mockTrigger: MockElement;
  let mockStorage: Storage;
  let storageStore: Record<string, string>;
  let docListeners: Record<string, Listener[]>;

  beforeEach(() => {
    storageStore = {};
    docListeners = {};

    mockStorage = {
      getItem: vi.fn((key: string) => storageStore[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storageStore[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete storageStore[key];
      }),
      clear: vi.fn(() => {
        storageStore = {};
      }),
      key: vi.fn(),
      length: 0,
    };

    mockMeta = createMockElement('meta', {
      name: 'color-scheme',
      content: 'light dark',
    });
    mockRoot = createMockElement('html');
    mockTrigger = createMockElement('button', { 'data-theme-trigger': '' });

    mockPopover = {
      hidePopover: vi.fn(),
    };

    mockOptions = [
      createMockElement('button', {
        themeOption: 'system',
        role: 'menuitemradio',
      }),
      createMockElement('button', {
        themeOption: 'light',
        role: 'menuitemradio',
      }),
      createMockElement('button', {
        themeOption: 'dark',
        role: 'menuitemradio',
      }),
      createMockElement('button', {
        themeOption: 'eclipse',
        role: 'menuitemradio',
      }),
    ];

    mockMenu = {
      querySelectorAll: vi.fn(() => mockOptions),
    };

    mockDoc = {
      documentElement: mockRoot,
      activeElement: null,
      querySelector: vi.fn((sel: string) => {
        if (sel.includes('meta')) return mockMeta;
        if (sel.includes('trigger')) return mockTrigger;
        return null;
      }),
      querySelectorAll: vi.fn((sel: string) => {
        if (sel.includes('theme-option')) return mockOptions;
        return [];
      }),
      createElement: vi.fn((tag: string) => createMockElement(tag)),
      head: {
        appendChild: vi.fn(),
      },
      addEventListener: vi.fn((event: string, handler: Listener) => {
        docListeners[event] = docListeners[event] ?? [];
        docListeners[event].push(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: Listener) => {
        if (docListeners[event]) {
          docListeners[event] = docListeners[event].filter(
            (h) => h !== handler,
          );
        }
      }),
    };
  });

  describe('persistTheme (AC3)', () => {
    it('removes storage key when theme is system', () => {
      mockStorage.setItem(STORAGE_KEY, 'dark');
      persistTheme('system', mockStorage);
      expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('stores literal theme when theme is light, dark, or eclipse', () => {
      persistTheme('light', mockStorage);
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'light');

      persistTheme('dark', mockStorage);
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'dark');

      persistTheme('eclipse', mockStorage);
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'eclipse');
    });

    it('handles throwing storage gracefully without throwing errors', () => {
      const throwingStorage = {
        ...mockStorage,
        setItem: vi.fn(() => {
          throw new Error('QuotaExceeded or SecurityError');
        }),
        removeItem: vi.fn(() => {
          throw new Error('SecurityError');
        }),
      };

      expect(() => persistTheme('dark', throwingStorage)).not.toThrow();
      expect(() => persistTheme('system', throwingStorage)).not.toThrow();
    });
  });

  describe('applyTheme (AC4)', () => {
    it('updates meta[name="color-scheme"] and removes data-theme for light and dark', () => {
      applyTheme('light', mockDoc as unknown as Document);
      expect(mockMeta.content).toBe('light');
      expect(mockRoot.removeAttribute).toHaveBeenCalledWith('data-theme');

      applyTheme('dark', mockDoc as unknown as Document);
      expect(mockMeta.content).toBe('dark');
      expect(mockRoot.removeAttribute).toHaveBeenCalledWith('data-theme');
    });

    it('sets data-theme="eclipse" and meta="light" for eclipse', () => {
      applyTheme('eclipse', mockDoc as unknown as Document);
      expect(mockMeta.content).toBe('light');
      expect(mockRoot.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'eclipse',
      );
    });

    it('sets meta="light dark" and clears data-theme for system', () => {
      applyTheme('system', mockDoc as unknown as Document);
      expect(mockMeta.content).toBe('light dark');
      expect(mockRoot.removeAttribute).toHaveBeenCalledWith('data-theme');
    });

    it('updates aria-checked on menu items matching the applied theme', () => {
      applyTheme('dark', mockDoc as unknown as Document);
      for (const btn of mockOptions) {
        const theme = btn.dataset.themeOption;
        expect(btn.setAttribute).toHaveBeenCalledWith(
          'aria-checked',
          theme === 'dark' ? 'true' : 'false',
        );
      }
    });
  });

  describe('initThemeSwitcher interactions', () => {
    it('delegates clicks on theme options to apply and persist theme and hide popover', () => {
      const cleanup = initThemeSwitcher(
        mockDoc as unknown as Document,
        mockStorage,
      );

      const darkOption = mockOptions.find(
        (o) => o.dataset.themeOption === 'dark',
      );
      if (!darkOption) throw new Error('Missing dark option');
      thisElement = darkOption;
      darkOption.closest = vi.fn((sel: string) => {
        if (sel === '[data-theme-option]') return darkOption;
        if (sel === '[popover]') return mockPopover;
        return null;
      });

      const clickHandler = docListeners.click?.[0];
      expect(clickHandler).toBeDefined();

      clickHandler?.({ target: darkOption });

      expect(mockMeta.content).toBe('dark');
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'dark');
      expect(mockPopover?.hidePopover).toHaveBeenCalled();
      expect(mockTrigger.focus).toHaveBeenCalled();

      cleanup?.();
    });

    it('initializes and applies the stored theme from storage to document and menu on startup (Spec 018 AC4)', () => {
      mockStorage.getItem = vi.fn().mockReturnValue('eclipse');

      const cleanup = initThemeSwitcher(
        mockDoc as unknown as Document,
        mockStorage,
      );

      const eclipseOption = mockOptions.find(
        (o) => o.dataset.themeOption === 'eclipse',
      );
      const systemOption = mockOptions.find(
        (o) => o.dataset.themeOption === 'system',
      );

      expect(eclipseOption?.setAttribute).toHaveBeenCalledWith(
        'aria-checked',
        'true',
      );
      expect(eclipseOption?.classList.add).toHaveBeenCalledWith('is-active');
      expect(systemOption?.setAttribute).toHaveBeenCalledWith(
        'aria-checked',
        'false',
      );

      cleanup?.();
    });
  });
});
