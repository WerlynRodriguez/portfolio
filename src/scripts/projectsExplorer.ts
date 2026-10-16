/**
 * Interactive Projects Master-Detail Explorer
 * Controls split-screen project selection and mobile drill-down navigation.
 */
export function initProjectsExplorer(root: ParentNode = document): () => void {
  const explorer = root.querySelector<HTMLElement>('[data-projects-explorer]');
  if (!explorer) return () => {};

  const triggers = Array.from(
    explorer.querySelectorAll<HTMLButtonElement>('[data-project-trigger]'),
  );
  const panels = Array.from(
    explorer.querySelectorAll<HTMLElement>('[data-project-panel]'),
  );
  const counter = explorer.querySelector<HTMLElement>('[data-project-counter]');
  const backBtn = explorer.querySelector<HTMLButtonElement>(
    '[data-project-back]',
  );
  const prevBtn = explorer.querySelector<HTMLButtonElement>(
    '[data-project-prev]',
  );
  const nextBtn = explorer.querySelector<HTMLButtonElement>(
    '[data-project-next]',
  );

  const total = triggers.length;
  if (total === 0) return () => {};

  let currentIndex = triggers.findIndex(
    (t) => t.getAttribute('aria-selected') === 'true',
  );
  if (currentIndex === -1) currentIndex = 0;

  function updateCounter(index: number) {
    if (!counter) return;
    const currentStr = String(index + 1).padStart(2, '0');
    const totalStr = String(total).padStart(2, '0');
    counter.textContent = `${currentStr} / ${totalStr}`;
  }

  function selectProject(index: number, shouldFocusTrigger = false) {
    if (index < 0 || index >= total) return;
    currentIndex = index;

    // Update triggers
    for (let i = 0; i < total; i++) {
      const trigger = triggers[i];
      const isSelected = i === index;
      trigger.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      trigger.tabIndex = isSelected ? 0 : -1;
      if (isSelected) {
        trigger.classList.add('is-active');
        if (shouldFocusTrigger) trigger.focus();
      } else {
        trigger.classList.remove('is-active');
      }
    }

    // Update panels
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const panelIndex = Number.parseInt(
        panel.getAttribute('data-project-panel') ?? `${i}`,
        10,
      );
      if (panelIndex === index) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    }

    updateCounter(index);
    explorer?.setAttribute('data-mobile-view', 'detail');
  }

  // Handle trigger clicks
  const onTriggerClick = (event: MouseEvent) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-project-trigger]',
    );
    if (!btn) return;
    const index = Number.parseInt(
      btn.getAttribute('data-project-trigger') ?? '0',
      10,
    );
    selectProject(index);
  };

  // Handle trigger keyboard navigation (tablist pattern)
  const onTriggerKeydown = (event: KeyboardEvent) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-project-trigger]',
    );
    if (!btn) return;

    let targetIndex = currentIndex;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % total;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + total) % total;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = total - 1;
        break;
      default:
        return;
    }

    selectProject(targetIndex, true);
  };

  // Back button (mobile)
  const onBackClick = () => {
    explorer.setAttribute('data-mobile-view', 'list');
    triggers[currentIndex]?.focus();
  };

  // Prev button
  const onPrevClick = () => {
    const prevIndex = (currentIndex - 1 + total) % total;
    selectProject(prevIndex);
  };

  // Next button
  const onNextClick = () => {
    const nextIndex = (currentIndex + 1) % total;
    selectProject(nextIndex);
  };

  explorer.addEventListener('click', onTriggerClick);
  explorer.addEventListener('keydown', onTriggerKeydown);
  backBtn?.addEventListener('click', onBackClick);
  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);

  // Initialize display
  updateCounter(currentIndex);

  return () => {
    explorer.removeEventListener('click', onTriggerClick);
    explorer.removeEventListener('keydown', onTriggerKeydown);
    backBtn?.removeEventListener('click', onBackClick);
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
  };
}

// Auto-boot on browser load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initProjectsExplorer());
  } else {
    initProjectsExplorer();
  }
}
