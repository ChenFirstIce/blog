import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { ArrowLeft, Share2, Layout as LayoutIcon, FileText, Columns } from 'lucide-react';
import { Mindmap } from '../components/Mindmap';
import { getPostBySlug } from '../lib/posts';

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);
  const [viewMode, setViewMode] = useState<'markdown' | 'mindmap' | 'split'>('markdown');
  const [activeId, setActiveId] = useState<string>('');

  const generateId = (text: string) => {
    return text.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '');
  };

  const getUniqueHeadingId = (text: string, counts: Map<string, number>) => {
    const baseId = generateId(text) || 'heading';
    const count = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, count);
    return count === 1 ? baseId : `${baseId}-${count}`;
  };

  const stripMarkdown = (md: string) => {
    return md
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const headings = useMemo(() => {
    const content = post?.body;
    if (!content) return [];

    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    const matches = [];
    const headingCounts = new Map<string, number>();
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = stripMarkdown(match[2]);
      const id = getUniqueHeadingId(text, headingCounts);
      matches.push({ level, text, id });
    }
    return matches;
  }, [post?.body]);

  const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getText).join('');
    if (node?.props?.children) return getText(node.props.children);
    if (node?.children) return getText(node.children);
    return '';
  };

  const renderedHeadingCounts = new Map<string, number>();

  const MarkdownComponents = {
    h1: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h1 id={id} className="scroll-mt-24">{children}</h1>;
    },
    h2: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h3 id={id} className="scroll-mt-24">{children}</h3>;
    },
    h4: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h4 id={id} className="scroll-mt-24">{children}</h4>;
    },
    h5: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h5 id={id} className="scroll-mt-24">{children}</h5>;
    },
    h6: ({ children }: any) => {
      const id = getUniqueHeadingId(getText(children), renderedHeadingCounts);
      return <h6 id={id} className="scroll-mt-24">{children}</h6>;
    },
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-8 rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 m-0">
          {children}
        </table>
      </div>
    ),
    img: ({ src, alt, ...props }: any) => (
      <span className="block my-10 text-center">
        <img
          src={src}
          alt={alt}
          className="rounded-3xl shadow-xl mx-auto max-w-full hover:scale-[1.02] transition-transform duration-500"
          referrerPolicy="no-referrer"
          {...props}
        />
        {alt && <span className="block mt-4 text-xs text-gray-400 font-medium italic">{alt}</span>}
      </span>
    ),
  };

  useEffect(() => {
    if (viewMode !== 'markdown' || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0% -80% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings, viewMode]);

  useEffect(() => {
    setActiveId('');
  }, [slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl text-center py-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl font-bold">Post not found</h1>
        <p className="text-gray-500">
          The article you are looking for does not exist or has not been published.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#ff7675] text-white rounded-xl text-sm font-bold hover:bg-[#ff5e5d] transition-all shadow-lg shadow-red-100"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${viewMode === 'split' ? 'max-w-none px-4 md:px-8' : 'max-w-6xl'}`}>
      <div className="flex items-center justify-between">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#ff7675] transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span>{post.date}</span>
          {post.category && (
            <Link
              to={`/blog/category/${post.categorySlug}`}
              className="font-bold uppercase tracking-widest hover:text-[#ff7675] transition-colors"
            >
              {post.category}
            </Link>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                to={`/blog/tag/${tag.slug}`}
                className="text-xs font-bold text-gray-400 hover:text-[#ff7675] transition-colors"
              >
                #{tag.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('markdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'markdown' ? 'bg-white shadow-sm text-[#ff7675]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} /> Article
          </button>
          <button
            onClick={() => setViewMode('mindmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'mindmap' ? 'bg-white shadow-sm text-[#ff7675]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutIcon size={16} /> Mindmap
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'split' ? 'bg-white shadow-sm text-[#ff7675]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Columns size={16} /> Split View
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className={`flex-1 min-w-0 w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${viewMode === 'split' ? 'h-[700px]' : ''}`}>
          {viewMode === 'markdown' ? (
            <div className="p-8 md:p-12">
              <div className="markdown-body prose prose-red max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={MarkdownComponents}
                >
                  {post.body}
                </ReactMarkdown>
              </div>
              {post.pdf && (
                <section className="mt-10 reveal space-y-4">
                  <h2 className="text-2xl font-bold">Related PDF</h2>
                  <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
                    <iframe src={post.pdf} title={`${post.title} PDF`} className="h-full w-full" />
                  </div>
                </section>
              )}
            </div>
          ) : viewMode === 'mindmap' ? (
            <div className="p-8 space-y-4 h-[600px]">
              <p className="text-sm text-gray-400 italic">Visualizing the structure of this post...</p>
              <Mindmap markdown={post.body} className="!h-[500px]" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row h-full divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden min-h-[340px]">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} /> Markdown
                  </div>
                </div>
                <textarea
                  readOnly
                  value={post.body}
                  className="flex-1 w-full p-4 bg-gray-50 rounded-2xl border-none font-mono text-sm resize-none cursor-not-allowed opacity-80"
                />
              </div>
              <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden min-h-[340px]">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutIcon size={14} /> Real-time Mindmap
                </div>
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-50">
                  <Mindmap markdown={post.body} className="!h-full border-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {viewMode === 'markdown' && headings.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-1 h-4 bg-[#ff7675] rounded-full"></div>
                Table of Contents
              </div>
              <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200 scroll-smooth">
                {headings.map((heading, index) => (
                  <a
                    key={`${heading.id}-${index}`}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block py-1.5 text-sm transition-all duration-200 hover:text-[#ff7675] hover:translate-x-1 ${
                      activeId === heading.id ? 'text-[#ff7675] font-bold translate-x-1' : 'text-gray-500'
                    } ${
                      heading.level === 1 ? 'font-bold' :
                      heading.level === 2 ? 'pl-4' :
                      heading.level === 3 ? 'pl-8 text-xs' :
                      'pl-12 text-xs'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      <footer className="pt-12 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="https://picsum.photos/seed/chen1ice/100/100" className="w-10 h-10 rounded-full" alt="Author" referrerPolicy="no-referrer" />
          <div>
            <p className="text-sm font-bold">Chen1Ice</p>
            <p className="text-xs text-gray-400">CS Student & Anime Lover</p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-[#ff7675] transition-colors" aria-label="Share post">
          <Share2 size={20} />
        </button>
      </footer>
    </article>
  );
};
