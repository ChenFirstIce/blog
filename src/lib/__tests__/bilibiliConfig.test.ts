import { describe, expect, it } from 'vitest';
import { getBilibiliUid } from '../bilibiliConfig';

describe('getBilibiliUid', () => {
  it('uses BILIBILI_UID when provided', () => {
    expect(getBilibiliUid({ BILIBILI_UID: '12345' })).toBe('12345');
  });

  it('falls back to the site owner UID for local development', () => {
    expect(getBilibiliUid({})).toBe('27553104');
  });
});
