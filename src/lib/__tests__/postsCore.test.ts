import { describe, expect, it } from 'vitest';
import {
  collectCategories,
  collectTags,
  filterPostsByCategorySlug,
  filterPostsByTagSlug,
  parseMarkdownPost,
  sortPostsByDateDesc,
} from '../postsCore';

const rawPost = `---
title: "React Hooks 笔记"
date: "2026-04-18"
category: "Learning Notes"
tags: ["React", "Markdown"]
excerpt: "Hooks learning summary."
pdf: "/pdf/hooks.pdf"
draft: false
---

# React Hooks

## useState

Content.
`;

describe('parseMarkdownPost', () => {
  it('parses posts without relying on a global Buffer', () => {
    const originalBuffer = globalThis.Buffer;

    try {
      // Browsers do not expose Node's Buffer global.
      (globalThis as typeof globalThis & { Buffer?: unknown }).Buffer = undefined;

      const post = parseMarkdownPost('/src/content/posts/react-hooks.md', rawPost);

      expect(post.title).toBe('React Hooks 笔记');
      expect(post.body).toContain('# React Hooks');
    } finally {
      globalThis.Buffer = originalBuffer;
    }
  });

  it('extracts frontmatter, body, slug, tag slugs, and category slug', () => {
    const post = parseMarkdownPost('/src/content/posts/react-hooks.md', rawPost);

    expect(post.slug).toBe('react-hooks');
    expect(post.title).toBe('React Hooks 笔记');
    expect(post.category).toBe('Learning Notes');
    expect(post.categorySlug).toBe('learning-notes');
    expect(post.tags.map((tag) => tag.slug)).toEqual(['react', 'markdown']);
    expect(post.pdf).toBe('/pdf/hooks.pdf');
    expect(post.body).toContain('## useState');
  });

  it('accepts an unquoted YAML date literal and normalizes it to YYYY-MM-DD', () => {
    const unquotedDatePost = rawPost.replace('date: "2026-04-18"', 'date: 2026-04-18');

    const post = parseMarkdownPost('/src/content/posts/react-hooks.md', unquotedDatePost);

    expect(post.date).toBe('2026-04-18');
  });

  it('accepts an unquoted YAML date literal with an inline comment', () => {
    const commentedDatePost = rawPost.replace('date: "2026-04-18"', 'date: 2026-04-18 # published');

    const post = parseMarkdownPost('/src/content/posts/react-hooks.md', commentedDatePost);

    expect(post.date).toBe('2026-04-18');
  });

  it('rejects an invalid unquoted YAML date literal', () => {
    const invalidUnquotedDatePost = rawPost.replace('date: "2026-04-18"', 'date: 2026-02-30');

    expect(() => parseMarkdownPost('/src/content/posts/react-hooks.md', invalidUnquotedDatePost)).toThrowError(
      'Post /src/content/posts/react-hooks.md has invalid frontmatter field: date'
    );
  });

  it('rejects malformed dates', () => {
    const invalidDatePost = rawPost.replace('2026-04-18', '2026-02-30');

    expect(() => parseMarkdownPost('/src/content/posts/react-hooks.md', invalidDatePost)).toThrowError(
      'Post /src/content/posts/react-hooks.md has invalid frontmatter field: date'
    );
  });

  it('rejects missing required fields', () => {
    const missingExcerptPost = rawPost.replace('excerpt: "Hooks learning summary."\n', '');

    expect(() => parseMarkdownPost('/src/content/posts/react-hooks.md', missingExcerptPost)).toThrowError(
      'Post /src/content/posts/react-hooks.md is missing required frontmatter field: excerpt'
    );
  });

  it('rejects non-array tags', () => {
    const invalidTagsPost = rawPost.replace('tags: ["React", "Markdown"]', 'tags: "React"');

    expect(() => parseMarkdownPost('/src/content/posts/react-hooks.md', invalidTagsPost)).toThrowError(
      'Post /src/content/posts/react-hooks.md frontmatter field "tags" must be an array'
    );
  });
});

describe('post collections', () => {
  const posts = [
    parseMarkdownPost('/src/content/posts/old.md', rawPost.replace('2026-04-18', '2026-04-01').replace('React Hooks 笔记', 'Old')),
    parseMarkdownPost('/src/content/posts/new.md', rawPost.replace('2026-04-18', '2026-04-20').replace('React Hooks 笔记', 'New').replace('["React", "Markdown"]', '["Life"]')),
  ];

  it('sorts posts by date descending', () => {
    expect(sortPostsByDateDesc(posts).map((post) => post.slug)).toEqual(['new', 'old']);
  });

  it('collects categories with counts', () => {
    expect(collectCategories(posts)).toEqual([{ label: 'Learning Notes', slug: 'learning-notes', count: 2 }]);
  });

  it('collects tags with counts', () => {
    expect(collectTags(posts)).toEqual([
      { label: 'Life', slug: 'life', count: 1 },
      { label: 'Markdown', slug: 'markdown', count: 1 },
      { label: 'React', slug: 'react', count: 1 },
    ]);
  });

  it('filters by category and tag slug', () => {
    expect(filterPostsByCategorySlug(posts, 'learning-notes')).toHaveLength(2);
    expect(filterPostsByTagSlug(posts, 'react').map((post) => post.slug)).toEqual(['old']);
  });
});
