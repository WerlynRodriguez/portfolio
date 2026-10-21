import { writeToClipboard } from './clipboard';

const RESET_MS = 2000;
const timers = new WeakMap<HTMLElement, number>();

export function setState(
  btn: HTMLElement,
  state: 'idle' | 'copied' | 'error',
): void {
  btn.dataset.state = state;
  const live = btn.querySelector('[role="status"]');
  if (live) {
    const copiedText = btn.dataset.copiedText || 'Copied';
    const errorText = btn.dataset.errorText || 'Copy failed';
    live.textContent =
      state === 'copied' ? copiedText : state === 'error' ? errorText : '';
  }

  const timer = timers.get(btn);
  if (timer !== undefined) {
    clearTimeout(timer);
  }

  if (state !== 'idle') {
    timers.set(
      btn,
      window.setTimeout(() => setState(btn, 'idle'), RESET_MS),
    );
  }
}

document.addEventListener('click', async (e) => {
  const target = e.target as Element | null;
  const btn = target?.closest<HTMLElement>('[data-button-copy]');
  const value = btn?.dataset.value;
  if (!btn || !value) return;

  const ok = await writeToClipboard(value, btn);
  if (!ok) {
    console.error('Copy failed');
  }
  setState(btn, ok ? 'copied' : 'error');
});
