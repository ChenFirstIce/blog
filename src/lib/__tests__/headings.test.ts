import { describe, expect, it } from 'vitest';
import { extractMarkdownHeadings, generateHeadingId, getUniqueHeadingId } from '../headings';

describe('heading helpers', () => {
  it('generates stable heading ids for English and Chinese text', () => {
    expect(generateHeadingId('Data Structures')).toBe('data-structures');
    expect(generateHeadingId('课程 笔记')).toBe('课程-笔记');
  });

  it('deduplicates repeated heading ids in markdown order', () => {
    const counts = new Map<string, number>();

    expect(getUniqueHeadingId('Intro', counts)).toBe('intro');
    expect(getUniqueHeadingId('Intro', counts)).toBe('intro-2');
  });

  it('extracts markdown headings with ids matching rendered order', () => {
    const headings = extractMarkdownHeadings(`# Title

## Intro
### Details
## Intro
`);

    expect(headings).toEqual([
      { level: 1, text: 'Title', id: 'title' },
      { level: 2, text: 'Intro', id: 'intro' },
      { level: 3, text: 'Details', id: 'details' },
      { level: 2, text: 'Intro', id: 'intro-2' },
    ]);
  });
});
