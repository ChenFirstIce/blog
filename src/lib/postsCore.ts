import type { PostSummary, PostTag, TaxonomyItem } from '../types';
import { filenameToSlug, slugify } from './slug';

interface RawPostMatter {
  title?: string;
  date?: string | Date;
  category?: string;
  tags?: string[];
  excerpt?: string;
  pdf?: string;
  draft?: boolean;
}

function extractFrontmatterBlock(raw: string): string | undefined {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  return match?.[1];
}

function extractBody(raw: string): string {
  return raw.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '').trim();
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(['"])(.*)\1$/);
  return match ? match[2] : trimmed;
}

function stripInlineComment(value: string): string {
  const quote = value.trim()[0];
  if (quote === '"' || quote === "'") {
    return value.trim();
  }

  return value.replace(/\s+#.*$/, '').trim();
}

function parseInlineStringArray(value: string, path: string): string[] {
  const trimmed = stripInlineComment(value);
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error(`Post ${path} frontmatter field "tags" must be an array`);
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];

  return inner.split(',').map((item) => stripWrappingQuotes(item));
}

function parseFrontmatter(raw: string, path: string): RawPostMatter {
  const frontmatter = extractFrontmatterBlock(raw);
  if (!frontmatter) return {};

  const data: RawPostMatter = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = stripInlineComment(rawValue);

    if (key === 'tags') {
      data.tags = parseInlineStringArray(rawValue, path);
    } else if (key === 'draft') {
      data.draft = value === 'true';
    } else if (key === 'title' || key === 'date' || key === 'category' || key === 'excerpt' || key === 'pdf') {
      data[key] = stripWrappingQuotes(value);
    }
  }

  return data;
}

function extractDateLiteral(raw: string): string | undefined {
  const frontmatter = extractFrontmatterBlock(raw);
  if (!frontmatter) {
    return undefined;
  }

  const match = frontmatter.match(/^date:\s*(.+)\s*$/m);
  return match?.[1].trim();
}

function assertString(value: unknown, field: string, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Post ${path} is missing required frontmatter field: ${field}`);
  }

  return value.trim();
}

function validateDateLiteral(literal: string, path: string): string {
  const unquoted = literal.match(/^(['"])(.*)\1$/);
  const date = unquoted ? unquoted[2] : (literal.match(/^(\d{4}-\d{2}-\d{2})(?:\s+#.*)?$/)?.[1] ?? literal);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Post ${path} has invalid frontmatter field: date`);
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Post ${path} has invalid frontmatter field: date`);
  }

  if (parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Post ${path} has invalid frontmatter field: date`);
  }

  return date;
}

function validateDate(value: unknown, path: string, rawLiteral?: string): string {
  if (rawLiteral) {
    return validateDateLiteral(rawLiteral, path);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`Post ${path} has invalid frontmatter field: date`);
    }

    return value.toISOString().slice(0, 10);
  }

  return validateDateLiteral(assertString(value, 'date', path), path);
}

function normalizeTags(tags: unknown, path: string): PostTag[] {
  if (!Array.isArray(tags)) {
    throw new Error(`Post ${path} frontmatter field "tags" must be an array`);
  }

  return tags.map((tag) => {
    const label = assertString(tag, 'tags[]', path);
    return { label, slug: slugify(label) };
  });
}

export function parseMarkdownPost(path: string, raw: string): PostSummary {
  const data = parseFrontmatter(raw, path);
  const rawDateLiteral = extractDateLiteral(raw);
  const category = assertString(data.category, 'category', path);

  return {
    slug: filenameToSlug(path),
    title: assertString(data.title, 'title', path),
    date: validateDate(data.date, path, rawDateLiteral),
    category,
    categorySlug: slugify(category),
    tags: normalizeTags(data.tags, path),
    excerpt: assertString(data.excerpt, 'excerpt', path),
    body: extractBody(raw),
    pdf: typeof data.pdf === 'string' && data.pdf.trim() ? data.pdf.trim() : undefined,
    draft: data.draft === true,
  };
}

export function sortPostsByDateDesc(posts: PostSummary[]): PostSummary[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function collectByKey(items: { label: string; slug: string }[]): TaxonomyItem[] {
  const map = new Map<string, TaxonomyItem>();

  for (const item of items) {
    const current = map.get(item.slug);
    if (current) {
      current.count += 1;
    } else {
      map.set(item.slug, { label: item.label, slug: item.slug, count: 1 });
    }
  }

  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function collectCategories(posts: PostSummary[]): TaxonomyItem[] {
  return collectByKey(posts.map((post) => ({ label: post.category, slug: post.categorySlug })));
}

export function collectTags(posts: PostSummary[]): TaxonomyItem[] {
  return collectByKey(posts.flatMap((post) => post.tags));
}

export function filterPostsByCategorySlug(posts: PostSummary[], categorySlug?: string): PostSummary[] {
  if (!categorySlug) return posts;

  return posts.filter((post) => post.categorySlug === categorySlug);
}

export function filterPostsByTagSlug(posts: PostSummary[], tagSlug?: string): PostSummary[] {
  if (!tagSlug) return posts;

  return posts.filter((post) => post.tags.some((tag) => tag.slug === tagSlug));
}
