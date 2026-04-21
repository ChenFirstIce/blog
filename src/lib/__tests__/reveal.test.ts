import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupRevealOnScroll } from '../reveal';

function createRevealElement() {
  const classes = new Set(['reveal']);

  return {
    classList: {
      add: (className: string) => classes.add(className),
      contains: (className: string) => classes.has(className),
    },
  } as unknown as HTMLElement;
}

function stubRevealElements(elements: HTMLElement[]) {
  vi.stubGlobal('document', {
    querySelectorAll: vi.fn(() => elements),
  });
}

function stubWindowPrefersReducedMotion(matches: boolean) {
  vi.stubGlobal('window', {
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
    const element = createRevealElement();
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
});
