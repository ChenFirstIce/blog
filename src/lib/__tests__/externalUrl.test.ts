import { describe, expect, it } from 'vitest';
import { toExternalUrl } from '../externalUrl';

describe('toExternalUrl', () => {
  it('adds https to bare hostnames so links do not resolve as local paths', () => {
    expect(toExternalUrl('blog.linda1729.com')).toBe('https://blog.linda1729.com');
  });

  it('keeps existing http and https URLs unchanged', () => {
    expect(toExternalUrl('https://blog.linda1729.com')).toBe('https://blog.linda1729.com');
    expect(toExternalUrl('http://blog.linda1729.com')).toBe('http://blog.linda1729.com');
  });
});
