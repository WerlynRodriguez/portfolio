const MOBILE_HEADER = '[data-mobile-header]';
const MOBILE_NAV_TRIGGER = '[data-mobile-nav-trigger]';
const MOBILE_NAV_BACKDROP = '[data-mobile-nav-backdrop]';
const NAV_LINK = '[data-nav-link]';

/**
 * Initializes interactive controls for the mobile top-drawer navigation header:
 * - Button toggle for drawer open/closed state
 * - Link click auto-dismissal
 * - Light-dismissal on outside and backdrop click
 * - Escape key dismissal with focus restoration
 * - Keyboard navigation (ArrowDown, ArrowUp, Home, End) inside drawer
 * - Automatic reset on viewport scale to tablet/desktop (>= 640px)
 */
export function initMobileNav(doc: Document = document): () => void {
  const header = doc.querySelector<HTMLElement>(MOBILE_HEADER);
  const trigger = doc.querySelector<HTMLButtonElement>(MOBILE_NAV_TRIGGER);
  const backdrop = doc.querySelector<HTMLElement>(MOBILE_NAV_BACKDROP);

  if (!header || !trigger) {
    return () => {};
  }

  const openLabel =
    trigger.dataset.openLabel ||
    trigger.getAttribute('aria-label') ||
    'Open navigation menu';
  const closeLabel = trigger.dataset.closeLabel || 'Close navigation menu';

  const isOpen = (): boolean => header.getAttribute('data-open') === 'true';

  const setOpen = (open: boolean): void => {
    header.setAttribute('data-open', open ? 'true' : 'false');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    trigger.setAttribute('aria-label', open ? closeLabel : openLabel);
    if (backdrop) {
      backdrop.setAttribute('data-open', open ? 'true' : 'false');
    }
  };

  // Ensure consistent initial state
  setOpen(false);

  const handleClick = (event: MouseEvent | { target: unknown }): void => {
    const target = event.target as Element | null;
    if (!target) return;

    // Toggle button clicked
    const clickedTrigger =
      target.closest<HTMLButtonElement>(MOBILE_NAV_TRIGGER);
    if (clickedTrigger) {
      setOpen(!isOpen());
      return;
    }

    if (!isOpen()) return;

    // Nav link clicked -> close drawer to allow smooth section scroll
    const clickedNavLink = target.closest<HTMLAnchorElement>(NAV_LINK);
    if (clickedNavLink) {
      setOpen(false);
      return;
    }

    // Backdrop clicked -> light dismiss
    const clickedBackdrop = target.closest(MOBILE_NAV_BACKDROP);
    if (clickedBackdrop) {
      setOpen(false);
      return;
    }

    // Clicked outside header -> light dismiss
    if (!header.contains(target as Node)) {
      setOpen(false);
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent | { key: string; preventDefault?: () => void },
  ): void => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault?.();
      setOpen(false);
      trigger.focus();
      return;
    }

    const activeEl = doc.activeElement as HTMLElement | null;
    const links = Array.from(doc.querySelectorAll<HTMLAnchorElement>(NAV_LINK));
    const len = links.length;

    if (len === 0 || !activeEl) return;

    const currentIndex = links.indexOf(activeEl as HTMLAnchorElement);
    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault?.();
        nextIndex = (currentIndex + 1) % len;
        break;

      case 'ArrowUp':
        event.preventDefault?.();
        nextIndex = (currentIndex - 1 + len) % len;
        break;

      case 'Home':
        event.preventDefault?.();
        nextIndex = 0;
        break;

      case 'End':
        event.preventDefault?.();
        nextIndex = len - 1;
        break;

      default:
        return;
    }

    links[nextIndex]?.focus();
  };

  doc.addEventListener('click', handleClick as EventListener);
  doc.addEventListener('keydown', handleKeyDown as EventListener);

  let mediaQueryList: MediaQueryList | null = null;
  const handleMediaChange = (e: { matches: boolean }): void => {
    if (e.matches && isOpen()) {
      setOpen(false);
    }
  };

  if (typeof matchMedia === 'function') {
    mediaQueryList = matchMedia('(min-width: 640px)');
    mediaQueryList.addEventListener?.('change', handleMediaChange);
  }

  return () => {
    doc.removeEventListener('click', handleClick as EventListener);
    doc.removeEventListener('keydown', handleKeyDown as EventListener);
    if (mediaQueryList) {
      mediaQueryList.removeEventListener?.('change', handleMediaChange);
    }
  };
}

// Auto-run in browser environment
if (typeof window !== 'undefined') {
  initMobileNav();
}
