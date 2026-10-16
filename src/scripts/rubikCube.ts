export interface RubikShakeState {
  topOffset: [number, number, number];
  lowOffset: [number, number, number];
  torque: number;
}

const ORIGIN_X = 294.75784985044646;
const ORIGIN_Y = 201.82768420069135;
const SCALE = 1.5191691871940818;
const AZIMUTH_RAD = (43 * Math.PI) / 180;
const ELEVATION_RAD = (30 * Math.PI) / 180;

const K_C = Math.cos(AZIMUTH_RAD) * SCALE;
const K_S = Math.sin(AZIMUTH_RAD) * SCALE;
const K_E = Math.sin(ELEVATION_RAD);
const K_Z = Math.cos(ELEVATION_RAD) * SCALE;
const K_S_E = K_S * K_E;
const K_C_E = K_C * K_E;

const DIAL_X = 68;
const DIAL_Y = 4;
const DIAL_R = 19;
const DIAL_TOP = 43;
const R_TIP = DIAL_R - 2.4;
const Z = DIAL_TOP + 0.1;

const ZERO_STATE: RubikShakeState = {
  topOffset: [0, 0, 0],
  lowOffset: [0, 0, 0],
  torque: 0,
};

const f2 = (n: number): string => n > -1e-6 && n < 1e-6 ? "0.00" : n.toFixed(2);

function projectIso(x: number, y: number, z: number): [number, number] {
  return [
    ORIGIN_X + x * K_C - y * K_S,
    ORIGIN_Y + x * K_S_E + y * K_C_E - z * K_Z,
  ];
}

export function translateIso(delta: [number, number, number]): string {
  const [x0, y0] = projectIso(0, 0, 0);
  const [x1, y1] = projectIso(delta[0], delta[1], delta[2]);
  return `translate(${f2(x1 - x0)} ${f2(y1 - y0)})`;
}

export function needlePathAt(turn: number): string {
  const angle = turn * Math.PI * 2;
  const [x0, y0] = projectIso(
    DIAL_X - Math.sin(angle) * 3.2,
    DIAL_Y + Math.cos(angle) * 3.2,
    Z,
  );
  const [x1, y1] = projectIso(
    DIAL_X + Math.sin(angle) * R_TIP,
    DIAL_Y - Math.cos(angle) * R_TIP,
    Z,
  );
  return `M${f2(x0)},${f2(y0)}L${f2(x1)},${f2(y1)}`;
}

export function evaluateRubikShake(t: number): RubikShakeState {
  if (t < 0 || t > 0.52) {
    return { topOffset: [0, 0, 0], lowOffset: [0, 0, 0], torque: 0 };
  }
  const ramp = t < 0.07
    ? Math.sin((t / 0.07) * (Math.PI / 2))
    : 1;
  const env = ramp * Math.exp(-t * 6.8);
  const wave = Math.sin(t * 72) * 0.65 + Math.sin(t * 125) * 0.35;
  const lunge = Math.exp(-t * 9) * 1.4;
  const dx = (lunge + wave * 2.2) * env;
  const dy = (-lunge * 0.85 - wave * 1.9) * env;
  const aw = Math.abs(wave);
  const dz = aw * 0.45 * env;
  const torque = Math.min(4.8, (lunge * 2.8 + aw * 3.6) * env);
  return {
    topOffset: [dx, dy, dz],
    lowOffset: [dx * 0.22, dy * 0.22, 0],
    torque,
  };
}

export function initRubikCube(root: ParentNode = document): void {
  const figures = root.querySelectorAll<HTMLElement>('[data-rubik-figure]');

  for (const figure of figures) {
    const stage = figure.querySelector<HTMLElement>('[data-rubik-stage]');
    if (!stage) continue;

    const topLayer = stage.querySelector<SVGElement>('[data-part="top-layer"]');
    const lowerLayer = stage.querySelector<SVGElement>(
      '[data-part="cube-lower"]',
    );
    const needle = stage.querySelector<SVGPathElement>('[data-part="needle"]');
    const readout = figure.querySelector<HTMLElement>('[data-readout]');

    const lockedLabel = readout?.getAttribute('data-locked-label') ?? 'locked';
    const jammedLabel = readout?.getAttribute('data-jammed-label') ?? 'jammed';

    const reducedMotion =
      typeof matchMedia === 'function'
        ? matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };

    let shakeTime = -1;
    let frame = 0;
    let last = 0;

    const draw = (state: RubikShakeState): void => {
      if (topLayer) topLayer.setAttribute('transform', translateIso(state.topOffset));
      if (lowerLayer) lowerLayer.setAttribute('transform', translateIso(state.lowOffset));

      if (needle) {
        const turn = 0.05 + (state.torque / 6.0) * 0.38;
        needle.setAttribute('d', needlePathAt(turn));
      }

      const isJammed = state.torque > 0.08;
      const nextStageState = isJammed ? 'jammed' : 'locked';
      if (stage.getAttribute('data-state') !== nextStageState) {
        stage.setAttribute('data-state', nextStageState);
      }

      if (readout) {
        const status = isJammed
          ? `${jammedLabel} · ${state.torque.toFixed(2)} N·m`
          : `${lockedLabel} · 0.00 N·m`;
        if (readout.textContent !== status) {
          readout.textContent = status;
        }
      }
    };

    const tick = (now: number): void => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      if (shakeTime >= 0) {
        shakeTime += dt;
        draw(evaluateRubikShake(shakeTime));
        if (shakeTime <= 0.52) {
          frame = requestAnimationFrame(tick);
          return;
        }
        shakeTime = -1;
        frame = 0;
        return;
      }
      draw(ZERO_STATE);
      frame = 0;
    };

    const triggerShake = (): void => {
      if (reducedMotion.matches) {
        draw(ZERO_STATE);
        return;
      }
      shakeTime = 0;
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    stage.addEventListener('click', () => triggerShake());
    stage.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        triggerShake();
      }
    });

    draw(ZERO_STATE);
  }
}
