import { describe, expect, it, vi } from 'vitest';
import { evaluateRubikShake, initRubikCube, translateIso } from './rubikCube';

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

  describe('translateIso', () => {
    it('projects 3D isometric offset vector into 2D SVG translate string', () => {
      const transform = translateIso([0, 0, 0]);
      expect(transform).toBe('translate(0.00 0.00)');

      const shifted = translateIso([2, -1, 0.5]);
      expect(shifted).toMatch(/^translate\(-?\d+\.\d{2} -?\d+\.\d{2}\)$/);
    });
  });

  describe('initRubikCube', () => {
    it('initializes stage state and updates readout on click when reduced motion is enabled', () => {
      const listeners: Record<string, ((event: unknown) => void)[]> = {};
      const topLayer = { setAttribute: vi.fn() };
      const lowerLayer = { setAttribute: vi.fn() };
      const needle = { setAttribute: vi.fn() };
      const readout = {
        textContent: '',
        getAttribute: vi.fn((attr: string) => {
          if (attr === 'data-locked-label') return 'locked';
          if (attr === 'data-jammed-label') return 'jammed';
          return null;
        }),
      };

      const stage = {
        setAttribute: vi.fn(),
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

      listeners.click?.[0]?.({});
      expect(readout.textContent).toBe('locked · 0.00 N·m (1x)');

      const preventDefault = vi.fn();
      listeners.keydown?.[0]?.({ key: ' ', preventDefault });
      expect(preventDefault).toHaveBeenCalled();
      expect(readout.textContent).toBe('locked · 0.00 N·m (2x)');

      vi.unstubAllGlobals();
    });
  });
});
