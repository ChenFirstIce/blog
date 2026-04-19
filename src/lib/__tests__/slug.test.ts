import { describe, expect, it } from 'vitest';
import { filenameToSlug, slugify } from '../slug';

describe('slugify', () => {
  it('creates stable lowercase slugs for English labels', () => {
    expect(slugify('Learning Notes')).toBe('learning-notes');
  });

  it('keeps Chinese text readable and removes unsafe punctuation', () => {
    expect(slugify('课程 笔记：React 入门')).toBe('课程-笔记-react-入门');
  });

  it('normalizes repeated separators', () => {
    expect(slugify(' React---Markdown  Notes ')).toBe('react-markdown-notes');
  });
});

describe('filenameToSlug', () => {
  it('uses the markdown filename as the post slug', () => {
    expect(filenameToSlug('/src/content/posts/react-hooks.md')).toBe('react-hooks');
  });

  it('normalizes spaced and cased English filenames', () => {
    expect(filenameToSlug('/src/content/posts/React Notes.md')).toBe('react-notes');
  });

  it('normalizes spaced Chinese filenames', () => {
    expect(filenameToSlug('/src/content/posts/课程 笔记.md')).toBe('课程-笔记');
  });
});
