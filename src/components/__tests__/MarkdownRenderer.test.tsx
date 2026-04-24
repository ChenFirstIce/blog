import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { extractMarkdownHeadings } from '../../lib/headings';

const renderMarkdown = (markdown: string) => renderToStaticMarkup(<MarkdownRenderer>{markdown}</MarkdownRenderer>);

describe('MarkdownRenderer', () => {
  it('renders math, footnotes, and heading anchors', () => {
    const html = renderMarkdown(`## Energy

Inline math $E = mc^2$.

A note.[^one]

[^one]: Footnote body.
`);

    expect(html).toContain('id="energy"');
    expect(html).toContain('markdown-heading-anchor');
    expect(html).toContain('katex');
    expect(html).toContain('Footnote body');
    expect(html).toContain('data-footnote-backref');
  });

  it('uses the same heading ids as the table of contents extractor', () => {
    const markdown = `## 课程 笔记

## 课程 笔记
`;
    const html = renderMarkdown(markdown);
    const headings = extractMarkdownHeadings(markdown);

    expect(headings.map((heading) => heading.id)).toEqual(['课程-笔记', '课程-笔记-2']);
    expect(html).toContain('id="课程-笔记"');
    expect(html).toContain('href="#课程-笔记"');
    expect(html).toContain('id="课程-笔记-2"');
    expect(html).toContain('href="#课程-笔记-2"');
  });

  it('sanitizes dangerous raw html while preserving safe inline html', () => {
    const html = renderMarkdown('<span data-label="ok">Safe</span><script>alert("x")</script>');

    expect(html).toContain('<span>Safe</span>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
    expect(html).not.toContain('data-label');
  });

  it('preserves Obsidian mark highlights', () => {
    const html = renderMarkdown(
      '<mark style="background: #BBFABBA6;">Styled</mark> and <mark class="hltr-red">Classed</mark>',
    );

    expect(html).toContain('<mark style="background:#BBFABBA6">Styled</mark>');
    expect(html).toContain('<mark class="hltr-red">Classed</mark>');
  });

  it('marks external links safe and leaves local links in the app', () => {
    const html = renderMarkdown('[External](https://example.com) and [Local](/blog)');

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="/blog"');
  });
});
