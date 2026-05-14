import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetScrollToTop, setupRevealOnScroll } from '../reveal';

function createRevealElement(rect: Partial<DOMRect> = {}) {
  const classes = new Set(['reveal']);

  return {
    classList: {
      add: (className: string) => classes.add(className),
      contains: (className: string) => classes.has(className),
    },
    getBoundingClientRect: () => ({
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }),
  } as unknown as HTMLElement;
}

function stubRevealElements(elements: HTMLElement[]) {
  vi.stubGlobal('document', {
    querySelectorAll: vi.fn(() => elements),
  });
}

function stubWindowPrefersReducedMotion(matches: boolean) {
  vi.stubGlobal('window', {
    innerHeight: 720,
    matchMedia: vi.fn(() => ({ matches })),
  });
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  reveal(target: Element) {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('setupRevealOnScroll', () => {
  afterEach(() => {
    MockIntersectionObserver.instances = [];
    vi.unstubAllGlobals();
  });

  it('marks reveal elements visible when reduced motion is preferred', () => {
    const element = createRevealElement();
    stubRevealElements([element]);
    stubWindowPrefersReducedMotion(true);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    setupRevealOnScroll();

    expect(element.classList.contains('is-visible')).toBe(true);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('reveals elements once they intersect', () => {
    const element = createRevealElement({ bottom: 900, top: 800, y: 800 });
    stubRevealElements([element]);
    stubWindowPrefersReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    setupRevealOnScroll();

    const observer = MockIntersectionObserver.instances[0];
    expect(observer.observe).toHaveBeenCalledWith(element);
    expect(element.classList.contains('is-visible')).toBe(false);

    observer.reveal(element);

    expect(element.classList.contains('is-visible')).toBe(true);
    expect(observer.unobserve).toHaveBeenCalledWith(element);
  });

  it('marks elements above the viewport visible instead of leaving routed content transparent', () => {
    const element = createRevealElement({ bottom: -10, top: -110, y: -110 });
    stubRevealElements([element]);
    stubWindowPrefersReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    setupRevealOnScroll();

    expect(element.classList.contains('is-visible')).toBe(true);
    expect(MockIntersectionObserver.instances[0].observe).not.toHaveBeenCalledWith(element);
  });

  it('marks tall elements visible when their top is already in the viewport', () => {
    const element = createRevealElement({ bottom: 12000, height: 12000, top: 300, y: 300 });
    stubRevealElements([element]);
    stubWindowPrefersReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    setupRevealOnScroll();

    expect(element.classList.contains('is-visible')).toBe(true);
    expect(MockIntersectionObserver.instances[0].observe).not.toHaveBeenCalledWith(element);
  });

  it('resets scroll to the top for client-side route changes', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('window', { scrollTo });

    resetScrollToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });
});
