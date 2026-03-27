import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import { Mindmap } from '../components/Mindmap';
import { format } from 'date-fns';
import { ArrowLeft, Share2, Layout as LayoutIcon, FileText, Columns, Save, Check } from 'lucide-react';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'markdown' | 'mindmap' | 'split'>('markdown');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setIsAdmin(user?.email === 'firsticychen@gmail.com');
    });

    return () => unsubscribeAuth();
  }, [id]);

  const handleSave = async () => {
    if (!id || !post) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, {
        content: editableContent
      });
      setPost({ ...post, content: editableContent });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading post...</div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  return (
    <article className={`mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${viewMode === 'split' ? 'max-w-none px-4 md:px-8' : 'max-w-3xl'}`}>
      <div className="flex items-center justify-between">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#ff7675] transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        {isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              isEditing ? 'bg-gray-100 text-gray-600' : 'bg-[#ff7675] text-white hover:bg-[#ee5253]'
            }`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Post'}
          </button>
        )}
      </div>

      <header className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="px-3 py-1 bg-red-50 text-[#ff7675] font-bold rounded-full uppercase tracking-wider text-[10px]">
            {post.category}
          </span>
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

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#ff7675] text-white rounded-xl font-bold hover:bg-[#ee5253] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : saveSuccess ? <><Check size={18} /> Saved</> : <><Save size={18} /> Save Changes</>}
          </button>
        )}
      </div>

      <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${viewMode === 'split' ? 'h-[700px]' : ''}`}>
        {viewMode === 'markdown' ? (
          <div className="p-8 md:p-12">
            {isEditing ? (
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full h-[500px] p-6 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100 font-mono text-sm resize-none"
              />
            ) : (
              <div className="markdown-body prose prose-red max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : viewMode === 'mindmap' ? (
          <div className="p-8 space-y-4 h-[600px]">
            <p className="text-sm text-gray-400 italic">Visualizing the structure of this post...</p>
            <Mindmap markdown={isEditing ? editableContent : post.content} className="!h-[500px]" />
          </div>
        ) : (
          <div className="flex h-full divide-x divide-gray-100">
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Markdown
              </div>
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                readOnly={!isEditing}
                className={`flex-1 w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100 font-mono text-sm resize-none ${!isEditing ? 'cursor-not-allowed opacity-80' : ''}`}
                placeholder="Content..."
              />
            </div>
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutIcon size={14} /> Real-time Mindmap
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-50">
                <Mindmap markdown={editableContent} className="!h-full border-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="pt-12 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="https://picsum.photos/seed/citrus/100/100" className="w-10 h-10 rounded-full" alt="Author" referrerPolicy="no-referrer" />
          <div>
            <p className="text-sm font-bold">Citrus</p>
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
