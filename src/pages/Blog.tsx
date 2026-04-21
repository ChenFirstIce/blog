import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, ListFilter, Search, Tag as TagIcon, X } from 'lucide-react';
import { allPosts, categories, getPostsByCategory, getPostsByTag, tags } from '../lib/posts';
import type { PostSummary } from '../types';

const PanelHeader: React.FC<{ title: string; meta?: string }> = ({ title, meta }) => (
  <div className="terminal-panel-title flex items-center justify-between px-4 py-3 font-mono text-xs">
    <span>{title}</span>
    {meta && <span className="text-[var(--color-primary)]">{meta}</span>}
  </div>
);

const PostPreview: React.FC<{ post: PostSummary; activeTag?: string; activeCategory?: string }> = ({
  post,
  activeTag,
  activeCategory,
}) => (
  <article className="border-b border-[var(--color-border)] py-6 last:border-b-0">
    <h2 className="mb-3 text-2xl font-semibold leading-tight text-[var(--color-text)]">
      <Link to={`/blog/${post.slug}`} className="hover:underline">
        # {post.title}
      </Link>
    </h2>

    <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--color-muted)]">
      <Link
        to={`/blog/category/${post.categorySlug}`}
        className={post.categorySlug === activeCategory ? 'font-bold text-[var(--color-primary)]' : 'hover:text-[var(--color-text)]'}
      >
        {post.category}
      </Link>
      <span>{post.date}</span>
    </div>

    <p className="mb-5 max-w-3xl text-base leading-7 text-[var(--color-muted)]">{post.excerpt}</p>

    <div className="mb-5 flex flex-wrap gap-2">
      {post.tags.map((tag) => (
        <Link
          key={tag.slug}
          to={`/blog/tag/${tag.slug}`}
          className={`terminal-chip ${tag.slug === activeTag ? '!border-[var(--color-primary)] !text-[var(--color-text)]' : ''}`}
        >
          #{tag.label}
        </Link>
      ))}
    </div>

    <Link
      to={`/blog/${post.slug}`}
      className="interactive inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-sm font-bold text-[var(--color-primary)]"
    >
      Read <ChevronRight size={16} />
    </Link>
  </article>
);

export const Blog: React.FC = () => {
  const { tagSlug, categorySlug } = useParams<{ tagSlug?: string; categorySlug?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const scopedPosts = useMemo(() => {
    if (tagSlug) return getPostsByTag(tagSlug);
    if (categorySlug) return getPostsByCategory(categorySlug);
    return allPosts;
  }, [tagSlug, categorySlug]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return scopedPosts;

    return scopedPosts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        post.date,
        ...post.tags.map((tag) => tag.label),
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, scopedPosts]);

  const activeTag = tags.find((tag) => tag.slug === tagSlug);
  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const isFiltered = Boolean(activeTag || activeCategory || tagSlug || categorySlug || query.trim());
  const activeFilterLabel = tagSlug
    ? `#${activeTag?.label ?? tagSlug}`
    : activeCategory?.label ?? categorySlug;

  const emptyMessage =
    allPosts.length === 0
      ? 'No posts published yet.'
      : 'No posts found for the current query.';

  return (
    <div className="space-y-8">
      <header className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="~/blog/index.md" meta={`${allPosts.length} posts`} />
        <div className="space-y-5 p-5 sm:p-7">
          <p className="font-mono text-sm text-[var(--color-primary)]">$ ls ./posts --sort=date</p>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)]">Blog</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--color-muted)]">
              Learning notes, course summaries, project logs, and occasional thoughts written as local Markdown.
            </p>
          </div>
        </div>
      </header>

      <section className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="search" meta="client-side" />
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
            <Search size={16} className="text-[var(--color-muted)]" />
            <span className="sr-only">Search posts</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="grep title, tag, category..."
              className="w-full bg-transparent font-mono text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            />
          </label>

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                navigate('/blog');
              }}
              className="interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 font-mono text-sm font-bold text-[var(--color-text)]"
            >
              <X size={16} />
              clear
            </button>
          )}
        </div>
      </section>

      {activeFilterLabel && (
        <div className="reveal flex items-center gap-2 font-mono text-sm text-[var(--color-muted)]">
          <span className="text-[var(--color-primary)]">$</span>
          <span>filter --by {activeFilterLabel}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <main className="reveal terminal-panel overflow-hidden">
          <PanelHeader title="posts" meta={`${filteredPosts.length} matched`} />
          <div className="px-5 sm:px-7">
            {filteredPosts.length === 0 ? (
              <div className="py-20 text-center">
                <BookOpen className="mx-auto mb-5 text-[var(--color-muted)]" size={48} />
                <p className="font-mono text-sm text-[var(--color-muted)]">{emptyMessage}</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostPreview
                  key={post.slug}
                  post={post}
                  activeTag={tagSlug}
                  activeCategory={categorySlug}
                />
              ))
            )}
          </div>
        </main>

        <aside className="reveal space-y-5">
          <section className="terminal-panel overflow-hidden">
            <PanelHeader title="categories" />
            <div className="grid gap-2 p-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/blog/category/${category.slug}`}
                  className={`interactive flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-sm ${
                    category.slug === categorySlug
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <ListFilter size={14} />
                    {category.label}
                  </span>
                  <span>{category.count}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="terminal-panel overflow-hidden">
            <PanelHeader title="tags" />
            <div className="flex flex-wrap gap-2 p-4">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  to={`/blog/tag/${tag.slug}`}
                  className={`terminal-chip ${tag.slug === tagSlug ? '!border-[var(--color-primary)] !bg-[var(--color-primary)] !text-[var(--color-primary-contrast)]' : ''}`}
                >
                  <TagIcon size={12} className="inline" /> {tag.label} {tag.count}
                </Link>
              ))}
            </div>
          </section>

          <section className="terminal-panel overflow-hidden">
            <PanelHeader title="archive" />
            <div className="space-y-3 p-4 font-mono text-sm text-[var(--color-muted)]">
              {allPosts.slice(0, 5).map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="block hover:text-[var(--color-text)]">
                  <span className="text-[var(--color-primary)]">&gt;</span> {post.title}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
