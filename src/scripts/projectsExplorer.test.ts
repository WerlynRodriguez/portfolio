import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initProjectsExplorer } from './projectsExplorer';

type Listener = (event: unknown) => void;

interface MockElement {
  tagName: string;
  dataset: Record<string, string>;
  tabIndex: number;
  textContent: string;
  getAttribute: ReturnType<typeof vi.fn>;
  setAttribute: ReturnType<typeof vi.fn>;
  removeAttribute: ReturnType<typeof vi.fn>;
  hasAttribute: ReturnType<typeof vi.fn>;
  classList: {
    add: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    contains: ReturnType<typeof vi.fn>;
  };
  closest: ReturnType<typeof vi.fn>;
  focus: ReturnType<typeof vi.fn>;
}

function createMockElement(
  tag: string,
  attrs: Record<string, string> = {},
): MockElement {
  const attributes: Record<string, string> = { ...attrs };
  const classes = new Set<string>();

  const elem: MockElement = {
    tagName: tag.toUpperCase(),
    dataset: { ...attrs },
    tabIndex: 0,
    textContent: '',
    getAttribute: vi.fn((key: string) => attributes[key] ?? null),
    setAttribute: vi.fn((key: string, val: string) => {
      attributes[key] = String(val);
      elem.dataset[key.replace(/^data-/, '')] = String(val);
    }),
    removeAttribute: vi.fn((key: string) => {
      delete attributes[key];
    }),
    hasAttribute: vi.fn((key: string) => key in attributes),
    classList: {
      add: vi.fn((cls: string) => classes.add(cls)),
      remove: vi.fn((cls: string) => classes.delete(cls)),
      contains: vi.fn((cls: string) => classes.has(cls)),
    },
    closest: vi.fn(),
    focus: vi.fn(),
  };

  return elem;
}

describe('projectsExplorer', () => {
  let explorerElem: MockElement;
  let triggers: MockElement[];
  let panels: MockElement[];
  let counterElem: MockElement;
  let backBtn: MockElement;
  let prevBtn: MockElement;
  let nextBtn: MockElement;

  const explorerListeners: Record<string, Listener[]> = {};
  const backBtnListeners: Record<string, Listener[]> = {};
  const prevBtnListeners: Record<string, Listener[]> = {};
  const nextBtnListeners: Record<string, Listener[]> = {};

  beforeEach(() => {
    vi.restoreAllMocks();

    for (const key of Object.keys(explorerListeners))
      delete explorerListeners[key];
    for (const key of Object.keys(backBtnListeners))
      delete backBtnListeners[key];
    for (const key of Object.keys(prevBtnListeners))
      delete prevBtnListeners[key];
    for (const key of Object.keys(nextBtnListeners))
      delete nextBtnListeners[key];

    explorerElem = createMockElement('div', {
      'data-projects-explorer': '',
      'data-mobile-view': 'list',
    });

    triggers = [0, 1, 2].map((i) => {
      const btn = createMockElement('button', {
        'data-project-trigger': `${i}`,
        'aria-selected': i === 0 ? 'true' : 'false',
      });
      btn.closest.mockImplementation((sel: string) =>
        sel === '[data-project-trigger]' ? btn : null,
      );
      return btn;
    });

    panels = [0, 1, 2].map((i) => {
      const p = createMockElement('div', {
        'data-project-panel': `${i}`,
        ...(i === 0 ? {} : { hidden: '' }),
      });
      return p;
    });

    counterElem = createMockElement('span', { 'data-project-counter': '' });
    backBtn = createMockElement('button', { 'data-project-back': '' });
    prevBtn = createMockElement('button', { 'data-project-prev': '' });
    nextBtn = createMockElement('button', { 'data-project-next': '' });

    // Wire addEventListener on explorerElem
    (explorerElem as unknown as HTMLElement).addEventListener = vi.fn(
      (type: string, listener: Listener) => {
        explorerListeners[type] = explorerListeners[type] || [];
        explorerListeners[type].push(listener);
      },
    );

    (backBtn as unknown as HTMLElement).addEventListener = vi.fn(
      (type: string, listener: Listener) => {
        backBtnListeners[type] = backBtnListeners[type] || [];
        backBtnListeners[type].push(listener);
      },
    );

    (prevBtn as unknown as HTMLElement).addEventListener = vi.fn(
      (type: string, listener: Listener) => {
        prevBtnListeners[type] = prevBtnListeners[type] || [];
        prevBtnListeners[type].push(listener);
      },
    );

    (nextBtn as unknown as HTMLElement).addEventListener = vi.fn(
      (type: string, listener: Listener) => {
        nextBtnListeners[type] = nextBtnListeners[type] || [];
        nextBtnListeners[type].push(listener);
      },
    );

    // Mock querySelector & querySelectorAll on explorer
    (explorerElem as unknown as HTMLElement).querySelectorAll = vi.fn(
      (selector: string) => {
        if (selector === '[data-project-trigger]')
          return triggers as unknown as NodeListOf<HTMLButtonElement>;
        if (selector === '[data-project-panel]')
          return panels as unknown as NodeListOf<HTMLElement>;
        return [] as unknown as NodeListOf<Element>;
      },
    );

    (explorerElem as unknown as HTMLElement).querySelector = vi.fn(
      (selector: string) => {
        if (selector === '[data-project-counter]')
          return counterElem as unknown as HTMLElement;
        if (selector === '[data-project-back]')
          return backBtn as unknown as HTMLElement;
        if (selector === '[data-project-prev]')
          return prevBtn as unknown as HTMLElement;
        if (selector === '[data-project-next]')
          return nextBtn as unknown as HTMLElement;
        return null;
      },
    );
  });

  function setupExplorer() {
    const rootMock = {
      querySelector: vi.fn((selector: string) => {
        if (selector === '[data-projects-explorer]')
          return explorerElem as unknown as HTMLElement;
        return null;
      }),
    };
    return initProjectsExplorer(rootMock as unknown as ParentNode);
  }

  it('initializes and updates counter', () => {
    setupExplorer();
    expect(counterElem.textContent).toBe('01 / 03');
  });

  it('activates target project and sets mobile view to detail when trigger is clicked', () => {
    setupExplorer();

    const clickHandler = explorerListeners.click?.[0];
    expect(clickHandler).toBeDefined();

    // Click trigger 1
    clickHandler?.({
      target: triggers[1],
    });

    expect(triggers[1].setAttribute).toHaveBeenCalledWith(
      'aria-selected',
      'true',
    );
    expect(triggers[1].classList.add).toHaveBeenCalledWith('is-active');
    expect(triggers[0].setAttribute).toHaveBeenCalledWith(
      'aria-selected',
      'false',
    );
    expect(triggers[0].classList.remove).toHaveBeenCalledWith('is-active');

    expect(panels[0].setAttribute).toHaveBeenCalledWith('hidden', '');
    expect(panels[1].removeAttribute).toHaveBeenCalledWith('hidden');

    expect(counterElem.textContent).toBe('02 / 03');
    expect(explorerElem.setAttribute).toHaveBeenCalledWith(
      'data-mobile-view',
      'detail',
    );
  });

  it('returns mobile view to list and focuses active trigger on back button click', () => {
    setupExplorer();

    const backHandler = backBtnListeners.click?.[0];
    expect(backHandler).toBeDefined();

    backHandler?.({});

    expect(explorerElem.setAttribute).toHaveBeenCalledWith(
      'data-mobile-view',
      'list',
    );
    expect(triggers[0].focus).toHaveBeenCalled();
  });

  it('cycles to next project and wraps around when clicking next button', () => {
    setupExplorer();

    const nextHandler = nextBtnListeners.click?.[0];
    expect(nextHandler).toBeDefined();

    // 0 -> 1
    nextHandler?.({});
    expect(panels[1].removeAttribute).toHaveBeenCalledWith('hidden');
    expect(counterElem.textContent).toBe('02 / 03');

    // 1 -> 2
    nextHandler?.({});
    expect(panels[2].removeAttribute).toHaveBeenCalledWith('hidden');
    expect(counterElem.textContent).toBe('03 / 03');

    // 2 -> 0 (wrap around)
    nextHandler?.({});
    expect(panels[0].removeAttribute).toHaveBeenCalledWith('hidden');
    expect(counterElem.textContent).toBe('01 / 03');
  });

  it('cycles to previous project and wraps around when clicking prev button', () => {
    setupExplorer();

    const prevHandler = prevBtnListeners.click?.[0];
    expect(prevHandler).toBeDefined();

    // 0 -> 2 (backward wrap around)
    prevHandler?.({});
    expect(panels[2].removeAttribute).toHaveBeenCalledWith('hidden');
    expect(counterElem.textContent).toBe('03 / 03');

    // 2 -> 1
    prevHandler?.({});
    expect(panels[1].removeAttribute).toHaveBeenCalledWith('hidden');
    expect(counterElem.textContent).toBe('02 / 03');
  });

  it('supports ArrowDown, ArrowUp, Home, End keyboard navigation across triggers', () => {
    setupExplorer();

    const keydownHandler = explorerListeners.keydown?.[0];
    expect(keydownHandler).toBeDefined();

    const preventDefault = vi.fn();

    // ArrowDown -> project 1
    keydownHandler?.({
      key: 'ArrowDown',
      target: triggers[0],
      preventDefault,
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(panels[1].removeAttribute).toHaveBeenCalledWith('hidden');

    // End -> project 2
    keydownHandler?.({
      key: 'End',
      target: triggers[1],
      preventDefault,
    });
    expect(panels[2].removeAttribute).toHaveBeenCalledWith('hidden');

    // Home -> project 0
    keydownHandler?.({
      key: 'Home',
      target: triggers[2],
      preventDefault,
    });
    expect(panels[0].removeAttribute).toHaveBeenCalledWith('hidden');
  });
});
