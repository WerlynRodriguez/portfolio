export async function writeToClipboard(
  text: string,
  host: HTMLElement,
): Promise<boolean> {
  // Throws (and is caught) if clipboard is undefined in insecure contexts
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through to legacy */
  }

  const prevFocus = document.activeElement as HTMLElement | null;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.readOnly = true;
  ta.style.cssText =
    'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  // Next to the button, so it works inside modals / focus traps
  (host.parentElement ?? document.body).appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length); // iOS

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {}
  ta.remove();
  prevFocus?.focus({ preventScroll: true });
  return ok;
}
