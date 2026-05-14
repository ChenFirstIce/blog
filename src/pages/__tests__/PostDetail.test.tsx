import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PostDetail } from '../PostDetail';

function renderPostDetail(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:slug" element={<PostDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PostDetail', () => {
  it('shows the full rendered article instead of making the summary look like markdown source', () => {
    const html = renderPostDetail('/blog/algorithm-hash');

    expect(html).not.toContain('># 算法笔记：哈希<');
    expect(html).not.toContain('整理哈希表常见应用场景、模板题和对应 C++ 解法。');
    expect(html).toContain('<h1');
    expect(html).toContain('算法笔记：哈希');
    expect(html).toContain('板子');
    expect(html).toContain('<pre>');
    expect(html).toContain('findDuplicates');
  });

  it('includes h1, h2, and h3 headings in the table of contents', () => {
    const html = renderPostDetail('/blog/algorithm-hash');

    expect(html).toContain('href="#算法笔记哈希"');
    expect(html).toContain('算法笔记：哈希');
    expect(html).toContain('href="#板子"');
    expect(html).toContain('板子');
    expect(html).toContain('href="#1-寻找重复元素"');
    expect(html).toContain('1. 寻找重复元素');
  });
});
