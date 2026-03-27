import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { Mindmap } from '../components/Mindmap';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Layout as LayoutIcon, FileText, Columns, Edit3, Save, Check, Bold, Italic, List, Code, X, Trash2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'markdown' | 'mindmap' | 'split'>('markdown');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ADMIN_EMAIL = 'firsticychen@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const generateId = (text: string) => {
    return text.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, ''); // Support Chinese characters and alphanumeric
  };

  const stripMarkdown = (md: string) => {
    return md
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/[*_~`]/g, '') // Bold, italic, strikethrough, inline code
      .replace(/<[^>]*>/g, '') // HTML tags
      .trim();
  };

  const headings = useMemo(() => {
    const content = post?.content;
    if (!content) return [];
    
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = stripMarkdown(match[2]);
      const id = generateId(text);
      matches.push({ level, text, id });
    }
    return matches;
  }, [post?.content]);

  const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getText).join('');
    if (node?.props?.children) return getText(node.props.children);
    if (node?.children) return getText(node.children);
    return '';
  };

  const MarkdownComponents = {
    h1: ({ children }: any) => {
      const id = generateId(getText(children));
      return <h1 id={id} className="scroll-mt-24">{children}</h1>;
    },
    h2: ({ children }: any) => {
      const id = generateId(getText(children));
      return <h2 id={id} className="scroll-mt-24">{children}</h2>;
    },
    h3: ({ children }: any) => {
      const id = generateId(getText(children));
      return <h3 id={id} className="scroll-mt-24">{children}</h3>;
    },
    h4: ({ children }: any) => {
      const id = generateId(getText(children));
      return <h4 id={id} className="scroll-mt-24">{children}</h4>;
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
    if (viewMode !== 'markdown' || isEditing || headings.length === 0) return;

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
        setEditableContent(data.content);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleSave = async () => {
    if (!id || !post) return;
    setIsSaving(true);
    const path = `posts/${id}`;
    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, {
        content: editableContent
      });
      setPost({ ...post, content: editableContent });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !isAdmin) return;
    
    setIsDeleting(true);
    const path = `posts/${id}`;
    try {
      await deleteDoc(doc(db, 'posts', id));
      navigate('/blog');
    } catch (error) {
      console.error("Error deleting post:", error);
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setEditableContent(newText);

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const EditorToolbar = () => (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
      <button
        onClick={() => insertMarkdown('**', '**')}
        className="p-1.5 hover:bg-white hover:text-[#ff7675] rounded-md transition-all text-gray-500"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => insertMarkdown('*', '*')}
        className="p-1.5 hover:bg-white hover:text-[#ff7675] rounded-md transition-all text-gray-500"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1"></div>
      <button
        onClick={() => insertMarkdown('\n- ')}
        className="p-1.5 hover:bg-white hover:text-[#ff7675] rounded-md transition-all text-gray-500"
        title="List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => insertMarkdown('```\n', '\n```')}
        className="p-1.5 hover:bg-white hover:text-[#ff7675] rounded-md transition-all text-gray-500"
        title="Code Block"
      >
        <Code size={16} />
      </button>
    </div>
  );

  if (loading) return <div className="text-center py-20">Loading post...</div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  return (
    <article className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${viewMode === 'split' ? 'max-w-none px-4 md:px-8' : 'max-w-6xl'}`}>
      <div className="flex items-center justify-between">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#ff7675] transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7675] text-white rounded-xl text-sm font-bold hover:bg-[#ff5e5d] transition-all disabled:opacity-50 shadow-lg shadow-red-100"
              >
                {isSaving ? 'Saving...' : saveSuccess ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditableContent(post.content);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </>
          ) : isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:border-[#ff7675] hover:text-[#ff7675] transition-all shadow-sm"
              >
                <Edit3 size={16} /> Edit Post
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete Post"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash2 size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Delete Post?</h3>
              <p className="text-gray-500">This action cannot be undone. Are you sure you want to delete this post?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className={`flex-1 min-w-0 w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${viewMode === 'split' || isEditing ? 'h-[700px]' : ''}`}>
          {isEditing ? (
            <div className="flex flex-col h-full">
              <EditorToolbar />
              <textarea
                ref={textareaRef}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="flex-1 w-full p-8 focus:outline-none font-mono text-sm resize-none bg-gray-50/30"
                placeholder="Write your post content here..."
              />
            </div>
          ) : viewMode === 'markdown' ? (
            <div className="p-8 md:p-12">
              <div className="markdown-body prose prose-red max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={MarkdownComponents}
                >
                  {post.content}
                </ReactMarkdown>
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

        {viewMode === 'markdown' && !isEditing && headings.length > 0 && (
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
