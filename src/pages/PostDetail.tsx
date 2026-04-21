import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getPostBySlug } from '../lib/posts';
import { extractMarkdownHeadings } from '../lib/headings';

const PanelHeader: React.FC<{ title: string; meta?: string }> = ({ title, meta }) => (
  <div className="terminal-panel-title flex items-center justify-between px-4 py-3 font-mono text-xs">
    <span>{title}</span>
    {meta && <span className="text-[var(--color-primary)]">{meta}</span>}
  </div>
);

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(true);

  const headings = useMemo(() => {
    const content = post?.body;
    if (!content) return [];
    return extractMarkdownHeadings(content);
  }, [post?.body]);

  const MarkdownComponents = {
    h1: ({ children }: any) => <h1 className="scroll-mt-24">{children}</h1>,
    h2: ({ children }: any) => <h2 className="scroll-mt-24">{children}</h2>,
    h3: ({ children }: any) => <h3 className="scroll-mt-24">{children}</h3>,
    h4: ({ children }: any) => <h4 className="scroll-mt-24">{children}</h4>,
    h5: ({ children }: any) => <h5 className="scroll-mt-24">{children}</h5>,
    h6: ({ children }: any) => <h6 className="scroll-mt-24">{children}</h6>,
    table: ({ children }: any) => (
      <div className="my-8 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="m-0 min-w-full divide-y divide-[var(--color-border)]">
          {children}
        </table>
      </div>
    ),
    img: ({ src, alt, ...props }: any) => (
      <span className="my-10 block text-center">
        <img
          src={src}
          alt={alt}
          className="mx-auto max-w-full rounded-lg border border-[var(--color-border)] transition-transform duration-300 hover:scale-[1.01]"
          referrerPolicy="no-referrer"
          {...props}
        />
        {alt && <span className="mt-3 block font-mono text-xs text-[var(--color-muted)]">{alt}</span>}
      </span>
    ),
  };

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6'));
    headings.forEach((heading, index) => {
      const node = nodes[index];
      if (node) node.id = heading.id;
    });
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6'));
    headings.forEach((heading, index) => {
      const node = nodes[index];
      if (node) node.id = heading.id;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0% -80% 0%' },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    setActiveId('');
  }, [slug]);

  if (!post) {
    return (
      <div className="reveal terminal-panel mx-auto max-w-3xl overflow-hidden text-center">
        <PanelHeader title="404.md" />
        <div className="space-y-5 p-8">
          <h1 className="text-4xl font-bold">Post not found</h1>
          <p className="text-[var(--color-muted)]">The article you are looking for does not exist or has not been published.</p>
          <Link
            to="/blog"
            className="interactive inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-mono text-sm font-bold text-[var(--color-primary-contrast)]"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl space-y-7">
      <div className="reveal flex items-center justify-between">
        <Link to="/blog" className="interactive inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-text)]">
          <ArrowLeft size={16} /> cd ../blog
        </Link>
      </div>

      <header className="reveal terminal-panel overflow-hidden">
        <PanelHeader title={`posts/${post.slug}.md`} meta={post.date} />
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--color-muted)]">
            <Link to={`/blog/category/${post.categorySlug}`} className="text-[var(--color-primary)] hover:underline">
              {post.category}
            </Link>
            {post.tags.map((tag) => (
              <Link key={tag.slug} to={`/blog/tag/${tag.slug}`} className="terminal-chip">
                #{tag.label}
              </Link>
            ))}
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[var(--color-text)] md:text-5xl">
            # {post.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-muted)]">{post.excerpt}</p>
        </div>
      </header>

      <div className="reveal grid gap-7 xl:grid-cols-[1fr_18rem]">
        <main className="terminal-panel min-w-0 overflow-hidden">
          <PanelHeader title="rendered article" />

          <div className="p-5 sm:p-8">
            <div className="markdown-body prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={MarkdownComponents}
              >
                {post.body}
              </ReactMarkdown>
            </div>
            {post.pdf && (
              <section className="mt-10 space-y-4">
                <h2 className="font-mono text-2xl font-bold text-[var(--color-text)]">## Related PDF</h2>
                <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                  <iframe src={post.pdf} title={`${post.title} PDF`} className="h-full w-full" />
                </div>
              </section>
            )}
          </div>
        </main>

        {headings.length > 0 && (
          <aside className="terminal-panel h-fit overflow-hidden xl:sticky xl:top-24">
            <details open={tocOpen} onToggle={(event) => setTocOpen(event.currentTarget.open)}>
              <summary className="terminal-panel-title interactive flex list-none items-center gap-2 px-4 py-3 font-mono text-sm font-bold text-[var(--color-text)] marker:hidden">
                <span className="grid size-6 place-items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-90">
                  <ChevronRight size={14} className={`transition-transform duration-200 ${tocOpen ? 'rotate-90' : ''}`} />
                </span>
                <span>Table of Contents</span>
              </summary>
              <nav className="max-h-[calc(100vh-180px)] overflow-y-auto p-4">
                <ul className="space-y-1 font-mono text-sm">
                  {headings
                    .filter((heading) => heading.level >= 2 && heading.level <= 3)
                    .map((heading, index) => (
                      <li key={`${heading.id}-${index}`}>
                        <a
                          href={`#${heading.id}`}
                          onClick={() => {
                            setActiveId(heading.id);
                          }}
                          className={`block rounded-md py-1.5 transition-colors hover:text-[var(--color-text)] ${
                            activeId === heading.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                          } ${heading.level === 3 ? 'pl-4 text-xs' : ''}`}
                        >
                          {heading.level === 2 ? '##' : '###'} {heading.text}
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>
            </details>
          </aside>
        )}
      </div>

      <footer className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="post.meta" />
        <div className="flex flex-col gap-4 p-5 font-mono text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="text-[var(--color-primary)]">author:</span> Chen1Ice
          </p>
          <p>
            <span className="text-[var(--color-primary)]">mode:</span> local markdown
          </p>
        </div>
      </footer>
    </article>
  );
};
