export function resetScrollToTop() {
  if (typeof window === 'undefined') return;

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function setupRevealOnScroll() {
  if (typeof window === 'undefined') return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (elements.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 },
  );

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isInOrAboveViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (rect.bottom < 0 || isInOrAboveViewport) {
      element.classList.add('is-visible');
      return;
    }

    observer.observe(element);
  });
}
