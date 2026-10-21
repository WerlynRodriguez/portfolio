import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initMobileNav } from './mobileNav';

type Listener = (event: unknown) => void;

interface MockElement {
  tagName: string;
  dataset: Record<string, string>;
  getAttribute: (key: string) => string | null;
  setAttribute: (key: string, val: string) => void;
  removeAttribute: (key: string) => void;
  focus: () => void;
  contains: (node: unknown) => boolean;
  closest: (sel: string) => MockElement | null;
  matches: (sel: string) => boolean;
}

function createMockElement(
  tag: string,
  attrs: Record<string, string> = {},
): MockElement {
  const attributes: Record<string, string> = { ...attrs };

  const el: MockElement = {
    tagName: tag.toUpperCase(),
    dataset: { ...attrs },
    getAttribute: vi.fn((key: string) => attributes[key] ?? null),
    setAttribute: vi.fn((key: string, val: string) => {
      attributes[key] = String(val);
      if (key.startsWith('data-')) {
        const camel = key
          .slice(5)
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        el.dataset[camel] = String(val);
      }
    }),
    removeAttribute: vi.fn((key: string) => {
      delete attributes[key];
      if (key.startsWith('data-')) {
        const camel = key
          .slice(5)
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        delete el.dataset[camel];
      }
    }),
    focus: vi.fn(),
    contains: vi.fn(() => false),
    closest: vi.fn(() => null),
    matches: vi.fn(() => false),
  };

  return el;
}

describe('mobileNav client controller (R3 / AC2, AC3, AC4, AC5)', () => {
  let docListeners: Record<string, Listener[]>;
  let mockDoc: {
    activeElement: MockElement | null;
    querySelector: ReturnType<typeof vi.fn>;
    querySelectorAll: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let header: MockElement;
  let trigger: MockElement;
  let drawer: MockElement;
  let backdrop: MockElement;
  let navLinks: MockElement[];

  beforeEach(() => {
    docListeners = {};

    header = createMockElement('header', {
      mobileHeader: '',
      open: 'false',
    });

    trigger = createMockElement('button', {
      mobileNavTrigger: '',
      openLabel: 'Open navigation menu',
      closeLabel: 'Close navigation menu',
    });
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open navigation menu');

    drawer = createMockElement('nav', {
      mobileNavDrawer: '',
    });

    backdrop = createMockElement('div', {
      mobileNavBackdrop: '',
    });

    navLinks = [
      createMockElement('a', { navLink: '' }),
      createMockElement('a', { navLink: '' }),
      createMockElement('a', { navLink: '' }),
    ];
    for (const link of navLinks) {
      link.matches = vi.fn((sel: string) => sel === '[data-nav-link]');
      link.closest = vi.fn((sel: string) =>
        sel === '[data-nav-link]' ? link : null,
      );
    }

    drawer.contains = vi.fn((node: unknown) =>
      navLinks.includes(node as MockElement),
    );
    header.contains = vi.fn(
      (node: unknown) =>
        node === header ||
        node === trigger ||
        node === drawer ||
        navLinks.includes(node as MockElement),
    );

    mockDoc = {
      activeElement: null,
      querySelector: vi.fn((sel: string) => {
        if (sel === '[data-mobile-header]') return header;
        if (sel === '[data-mobile-nav-trigger]') return trigger;
        if (sel === '[data-mobile-nav-drawer]') return drawer;
        if (sel === '[data-mobile-nav-backdrop]') return backdrop;
        return null;
      }),
      querySelectorAll: vi.fn((sel: string) => {
        if (sel === '[data-nav-link]') return navLinks;
        return [];
      }),
      addEventListener: vi.fn((type: string, handler: Listener) => {
        docListeners[type] = docListeners[type] ?? [];
        docListeners[type].push(handler);
      }),
      removeEventListener: vi.fn((type: string, handler: Listener) => {
        if (!docListeners[type]) return;
        docListeners[type] = docListeners[type].filter((h) => h !== handler);
      }),
    };
  });

  it('initializes with closed drawer state', () => {
    initMobileNav(mockDoc as unknown as Document);

    expect(header.getAttribute('data-open')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles open and closed when trigger button is clicked (AC2)', () => {
    initMobileNav(mockDoc as unknown as Document);

    // Simulate clicking trigger button
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({
      target: trigger,
    });

    expect(header.getAttribute('data-open')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-label')).toBe('Close navigation menu');

    // Click trigger again to close
    docListeners.click?.[0]?.({
      target: trigger,
    });

    expect(header.getAttribute('data-open')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe('Open navigation menu');
  });

  it('closes drawer when a navigation link is clicked (AC3)', () => {
    initMobileNav(mockDoc as unknown as Document);

    // Open first
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });
    expect(header.getAttribute('data-open')).toBe('true');

    // Click nav link
    const link = navLinks[1];
    trigger.closest = vi.fn(() => null);
    docListeners.click?.[0]?.({ target: link });

    expect(header.getAttribute('data-open')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes drawer on outside click and backdrop click (AC3)', () => {
    initMobileNav(mockDoc as unknown as Document);

    // Open first
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });
    expect(header.getAttribute('data-open')).toBe('true');

    // Click backdrop
    trigger.closest = vi.fn(() => null);
    backdrop.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-backdrop]' ? backdrop : null,
    );
    docListeners.click?.[0]?.({ target: backdrop });

    expect(header.getAttribute('data-open')).toBe('false');

    // Reopen
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });
    expect(header.getAttribute('data-open')).toBe('true');

    // Click completely outside
    const outsideEl = createMockElement('div');
    trigger.closest = vi.fn(() => null);
    backdrop.closest = vi.fn(() => null);
    header.contains = vi.fn(() => false);
    docListeners.click?.[0]?.({ target: outsideEl });

    expect(header.getAttribute('data-open')).toBe('false');
  });

  it('closes drawer and restores focus on Escape keydown (AC4)', () => {
    initMobileNav(mockDoc as unknown as Document);

    // Open first
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });
    expect(header.getAttribute('data-open')).toBe('true');

    // Press Escape
    docListeners.keydown?.[0]?.({
      key: 'Escape',
      preventDefault: vi.fn(),
    });

    expect(header.getAttribute('data-open')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.focus).toHaveBeenCalled();
  });

  it('supports arrow key navigation inside open drawer (AC4)', () => {
    initMobileNav(mockDoc as unknown as Document);

    // Open drawer
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });

    // Focus link 0
    mockDoc.activeElement = navLinks[0];

    const preventDefault = vi.fn();
    docListeners.keydown?.[0]?.({
      key: 'ArrowDown',
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(navLinks[1].focus).toHaveBeenCalled();

    // ArrowUp wraps from link 0 to last link
    mockDoc.activeElement = navLinks[0];
    docListeners.keydown?.[0]?.({
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    });
    expect(navLinks[2].focus).toHaveBeenCalled();

    // End key moves to last link
    mockDoc.activeElement = navLinks[0];
    docListeners.keydown?.[0]?.({
      key: 'End',
      preventDefault: vi.fn(),
    });
    expect(navLinks[2].focus).toHaveBeenCalled();

    // Home key moves to first link
    mockDoc.activeElement = navLinks[2];
    docListeners.keydown?.[0]?.({
      key: 'Home',
      preventDefault: vi.fn(),
    });
    expect(navLinks[0].focus).toHaveBeenCalled();
  });

  it('resets drawer when viewport scales to tablet/desktop >= 640px (AC5)', () => {
    let mediaChangeCallback: ((e: { matches: boolean }) => void) | undefined;
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(
          (_: string, cb: (e: { matches: boolean }) => void) => {
            mediaChangeCallback = cb;
          },
        ),
        removeEventListener: vi.fn(),
      })),
    );

    initMobileNav(mockDoc as unknown as Document);

    // Open drawer
    trigger.closest = vi.fn((sel: string) =>
      sel === '[data-mobile-nav-trigger]' ? trigger : null,
    );
    docListeners.click?.[0]?.({ target: trigger });
    expect(header.getAttribute('data-open')).toBe('true');

    // Simulate resize to tablet (matches: true for min-width: 640px)
    if (mediaChangeCallback) {
      (mediaChangeCallback as (e: { matches: boolean }) => void)({
        matches: true,
      });
    }

    expect(header.getAttribute('data-open')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    vi.unstubAllGlobals();
  });

  it('removes all event listeners upon calling cleanup function', () => {
    const mediaRemoveListener = vi.fn();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: mediaRemoveListener,
      })),
    );

    const cleanup = initMobileNav(mockDoc as unknown as Document);

    expect(docListeners.click?.length).toBeGreaterThan(0);
    expect(docListeners.keydown?.length).toBeGreaterThan(0);

    cleanup();

    expect(docListeners.click?.length ?? 0).toBe(0);
    expect(docListeners.keydown?.length ?? 0).toBe(0);
    expect(mediaRemoveListener).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
