import { describe, expect, it, vi } from 'vitest';
import {
  evaluateRubikShake,
  initRubikCube,
  translateCss,
  translateIso,
} from './rubikCube';

describe('rubikCube', () => {
  describe('evaluateRubikShake', () => {
    it('returns rest state before start (t < 0) and after completion (t > 0.52)', () => {
      expect(evaluateRubikShake(-0.1)).toEqual({
        topOffset: [0, 0, 0],
        lowOffset: [0, 0, 0],
        torque: 0,
      });

      expect(evaluateRubikShake(0.6)).toEqual({
        topOffset: [0, 0, 0],
        lowOffset: [0, 0, 0],
        torque: 0,
      });
    });

    it('produces non-zero damped shudder offsets and positive torque during active window', () => {
      const mid = evaluateRubikShake(0.03);
      expect(mid.torque).toBeGreaterThan(0.5);
      expect(Math.hypot(...mid.topOffset)).toBeGreaterThan(0.5);
      expect(Math.hypot(...mid.lowOffset)).toBeGreaterThan(0);
      expect(Math.hypot(...mid.topOffset)).toBeGreaterThan(
        Math.hypot(...mid.lowOffset),
      );
    });
  });

  describe('translateCss', () => {
    it('projects 3D isometric offset vector into percentage-based CSS translate', () => {
      expect(translateCss([0, 0, 0])).toBe('translate(0.000%, 0.000%)');
      const shifted = translateCss([2, -1, 0.5]);
      expect(shifted).toMatch(/^translate\(-?\d+\.\d{3}%, -?\d+\.\d{3}%\)$/);
    });
  });

  describe('translateIso', () => {
    it('projects 3D isometric offset vector into 2D SVG translate string', () => {
      const transform = translateIso([0, 0, 0]);
      expect(transform).toBe('translate(0.00 0.00)');

      const shifted = translateIso([2, -1, 0.5]);
      expect(shifted).toMatch(/^translate\(-?\d+\.\d{2} -?\d+\.\d{2}\)$/);
    });
  });

  describe('initRubikCube', () => {
    it('initializes stage state and handles interaction when reduced motion is enabled', () => {
      const listeners: Record<string, ((event: unknown) => void)[]> = {};
      const topLayer = {
        style: { transform: '' },
        setAttribute: vi.fn(),
      };
      const lowerLayer = {
        style: { transform: '' },
        setAttribute: vi.fn(),
      };
      const needle = { setAttribute: vi.fn() };
      const readout = {
        textContent: '',
        getAttribute: vi.fn((attr: string) => {
          if (attr === 'data-locked-label') return 'locked';
          if (attr === 'data-jammed-label') return 'jammed';
          return null;
        }),
      };

      const stageAttrs: Record<string, string> = {};
      const stage = {
        dataset: {} as Record<string, string>,
        getAttribute: vi.fn((key: string) => stageAttrs[key] ?? null),
        setAttribute: vi.fn((key: string, val: string) => {
          stageAttrs[key] = val;
        }),
        addEventListener: vi.fn(
          (type: string, handler: (event: unknown) => void) => {
            listeners[type] = listeners[type] ?? [];
            listeners[type].push(handler);
          },
        ),
        querySelector: vi.fn((sel: string) => {
          if (sel === '[data-part="top-layer"]') return topLayer;
          if (sel === '[data-part="cube-lower"]') return lowerLayer;
          if (sel === '[data-part="needle"]') return needle;
          return null;
        }),
      };

      const figure = {
        querySelector: vi.fn((sel: string) => {
          if (sel === '[data-rubik-stage]') return stage;
          if (sel === '[data-readout]') return readout;
          return null;
        }),
      };

      const root = {
        querySelectorAll: vi.fn(() => [figure]),
      } as unknown as ParentNode;

      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true })),
      );

      initRubikCube(root);

      expect(stage.setAttribute).toHaveBeenCalledWith('data-state', 'locked');
      expect(readout.textContent).toBe('locked · 0.00 N·m');
      expect(stage.dataset.animating).toBeUndefined();

      listeners.click?.[0]?.({});
      expect(readout.textContent).toBe('locked · 0.00 N·m');
      expect(stage.dataset.animating).toBeUndefined();

      const preventDefault = vi.fn();
      listeners.keydown?.[0]?.({ key: ' ', preventDefault });
      expect(preventDefault).toHaveBeenCalled();
      expect(readout.textContent).toBe('locked · 0.00 N·m');

      vi.unstubAllGlobals();
    });

    it('triggers shudder animation and updates data-animating and data-state when reduced motion is false', () => {
      const listeners: Record<string, ((event: unknown) => void)[]> = {};
      const topLayer = {
        style: { transform: '' },
        setAttribute: vi.fn(),
      };
      const lowerLayer = {
        style: { transform: '' },
        setAttribute: vi.fn(),
      };
      const needle = { setAttribute: vi.fn() };
      const readout = {
        textContent: '',
        getAttribute: vi.fn((attr: string) => {
          if (attr === 'data-locked-label') return 'locked';
          if (attr === 'data-jammed-label') return 'jammed';
          return null;
        }),
      };

      const stageAttrs: Record<string, string> = {};
      const stage = {
        dataset: {} as Record<string, string>,
        getAttribute: vi.fn((key: string) => stageAttrs[key] ?? null),
        setAttribute: vi.fn((key: string, val: string) => {
          stageAttrs[key] = val;
        }),
        addEventListener: vi.fn(
          (type: string, handler: (event: unknown) => void) => {
            listeners[type] = listeners[type] ?? [];
            listeners[type].push(handler);
          },
        ),
        querySelector: vi.fn((sel: string) => {
          if (sel === '[data-part="top-layer"]') return topLayer;
          if (sel === '[data-part="cube-lower"]') return lowerLayer;
          if (sel === '[data-part="needle"]') return needle;
          return null;
        }),
      };

      const figure = {
        querySelector: vi.fn((sel: string) => {
          if (sel === '[data-rubik-stage]') return stage;
          if (sel === '[data-readout]') return readout;
          return null;
        }),
      };

      const root = {
        querySelectorAll: vi.fn(() => [figure]),
      } as unknown as ParentNode;

      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: false })),
      );

      let rafCallback: ((now: number) => void) | null = null;
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb: (now: number) => void) => {
          rafCallback = cb;
          return 1;
        }),
      );

      initRubikCube(root);
      expect(readout.textContent).toBe('locked · 0.00 N·m');

      // Click triggers shake
      listeners.click?.[0]?.({});
      expect(typeof rafCallback).toBe('function');
      expect(stage.dataset.animating).toBe('');

      // First tick at 30ms (peak shudder)
      if (rafCallback) {
        (rafCallback as (now: number) => void)(30);
      }
      expect(stageAttrs['data-state']).toBe('jammed');
      expect(readout.textContent).toContain('jammed ·');
      expect(topLayer.style.transform).toMatch(/^translate\(-?\d+\.\d{3}%/);

      // Advance animation frames until shakeTime completes (> 0.52s)
      for (let t = 1; t <= 25; t++) {
        if (rafCallback) {
          (rafCallback as (now: number) => void)(t * 30);
        }
      }
      expect(stage.dataset.animating).toBeUndefined();

      vi.unstubAllGlobals();
    });
  });
});
