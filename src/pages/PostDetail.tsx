import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import { Mindmap } from '../components/Mindmap';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Layout as LayoutIcon, FileText, Columns } from 'lucide-react';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'markdown' | 'mindmap' | 'split'>('markdown');
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    const content = post?.content;
    if (!content) return [];
    
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      const id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      matches.push({ level, text, id });
    }
    return matches;
  }, [post?.content]);

  const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getText).join('');
    if (node?.props?.children) return getText(node.props.children);
    return '';
  };

  const MarkdownComponents = {
    h1: ({ children }: any) => {
      const id = getText(children).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h1 id={id} className="scroll-mt-24">{children}</h1>;
    },
    h2: ({ children }: any) => {
      const id = getText(children).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const id = getText(children).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h3 id={id} className="scroll-mt-24">{children}</h3>;
    },
    h4: ({ children }: any) => {
      const id = getText(children).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h4 id={id} className="scroll-mt-24">{children}</h4>;
    },
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
    const fetchPost = async () => {
      if (!id) return;
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Post;
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading post...</div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  return (
    <article className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${viewMode === 'split' ? 'max-w-none px-4 md:px-8' : 'max-w-6xl'}`}>
      <div className="flex items-center justify-between">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#ff7675] transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy') : 'Recently'}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map(tag => (
              <Link 
                key={tag} 
                to={`/blog/tag/${tag}`}
                className="text-xs font-bold text-gray-400 hover:text-[#ff7675] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* View Toggle & Actions */}
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
                <ReactMarkdown components={MarkdownComponents}>{post.content}</ReactMarkdown>
              </div>
            </div>
          ) : viewMode === 'mindmap' ? (
            <div className="p-8 space-y-4 h-[600px]">
              <p className="text-sm text-gray-400 italic">Visualizing the structure of this post...</p>
              <Mindmap markdown={post.content} className="!h-[500px]" />
            </div>
          ) : (
            <div className="flex h-full divide-x divide-gray-100">
              <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} /> Markdown
                  </div>
                </div>
                <textarea
                  readOnly
                  value={post.content}
                  className="flex-1 w-full p-4 bg-gray-50 rounded-2xl border-none font-mono text-sm resize-none cursor-not-allowed opacity-80"
                />
              </div>
              <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutIcon size={14} /> Real-time Mindmap
                </div>
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-50">
                  <Mindmap markdown={post.content} className="!h-full border-none" />
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
        <button className="p-2 text-gray-400 hover:text-[#ff7675] transition-colors">
          <Share2 size={20} />
        </button>
      </footer>
    </article>
  );
};
