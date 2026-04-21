/// <reference types="vite/client" />

import type { PostSummary } from '../types';
import {
  collectCategories,
  collectTags,
  filterPostsByCategorySlug,
  filterPostsByTagSlug,
  parseMarkdownPost,
  sortPostsByDateDesc,
} from './postsCore';

const modules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const allPosts: PostSummary[] = sortPostsByDateDesc(
  Object.entries(modules)
    .map(([path, raw]) => parseMarkdownPost(path, String(raw)))
    .filter((post) => !post.draft),
);

export const categories = collectCategories(allPosts);
export const tags = collectTags(allPosts);

export function getRecentPosts(limit = 3): PostSummary[] {
  return allPosts.slice(0, limit);
}

export function getPostBySlug(slug: string | undefined): PostSummary | undefined {
  if (!slug) return undefined;
  return allPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(categorySlug: string | undefined): PostSummary[] {
  return filterPostsByCategorySlug(allPosts, categorySlug);
}

export function getPostsByTag(tagSlug: string | undefined): PostSummary[] {
  return filterPostsByTagSlug(allPosts, tagSlug);
}
