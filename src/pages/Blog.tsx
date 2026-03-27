import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, Plus, X, Tag as TagIcon, LayoutGrid, ListFilter, ArrowLeft } from 'lucide-react';

export const Blog: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    excerpt: '', 
    tags: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
      setLoading(false);
    });

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setIsAdmin(user?.email === 'firsticychen@gmail.com');
    });

    return () => { unsubscribe(); unsubscribeAuth(); };
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (tag) {
      result = result.filter(post => post.tags?.includes(tag));
    }
    return result;
  }, [posts, tag]);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const tagsArray = newPost.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    await addDoc(collection(db, 'posts'), {
      title: newPost.title,
      content: newPost.content,
      excerpt: newPost.excerpt,
      tags: tagsArray,
      authorId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    
    setShowAddModal(false);
    setNewPost({ title: '', content: '', excerpt: '', tags: '' });
  };

  if (loading) return <div className="text-center py-20">Loading posts...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-gray-500">Sharing my learning journey and random thoughts.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff7675] text-white rounded-full font-bold hover:bg-[#ee5253] shadow-lg shadow-red-100 transition-all active:scale-95"
          >
            <Plus size={20} /> New Post
          </button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-4">
        {/* Active Tag Indicator */}
        {tag && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-[#ff7675] rounded-xl text-sm font-bold animate-in fade-in zoom-in duration-300">
            <TagIcon size={14} />
            Filtering by: #{tag}
            <button 
              onClick={() => navigate('/blog')}
              className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <BookOpen className="mx-auto text-gray-200 mb-6" size={64} />
              <p className="text-gray-400 font-medium">No posts found {tag ? `with tag #${tag}` : ''}.</p>
              {tag && (
                <button 
                  onClick={() => navigate('/blog')}
                  className="mt-4 text-[#ff7675] font-bold hover:underline"
                >
                  View all posts
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`}
                className="group block p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-50/50 transition-all hover:-translate-y-1"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {post.tags?.slice(0, 3).map(t => (
                        <span key={t} className={`text-[10px] font-bold ${t === tag ? 'text-[#ff7675]' : 'text-gray-400'}`}>#{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4 group-hover:text-[#ff7675] transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-gray-500 line-clamp-2 mb-8 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-black text-[#ff7675] uppercase tracking-widest">
                  Read Article <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-10">
          <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <TagIcon size={20} className="text-[#ff7675]" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No tags yet.</p>
              ) : (
                allTags.map(t => (
                  <Link
                    key={t}
                    to={`/blog/tag/${t}`}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                      t === tag 
                        ? 'bg-[#ff7675] text-white' 
                        : 'bg-gray-50 text-gray-500 hover:bg-[#ff7675] hover:text-white'
                    }`}
                  >
                    #{t}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <ListFilter size={20} className="text-[#ff7675]" />
              Recent Posts
            </h3>
            <div className="space-y-4">
              {posts.slice(0, 5).map(p => (
                <Link 
                  key={p.id} 
                  to={`/blog/${p.id}`}
                  className="block group"
                >
                  <p className="text-sm font-bold group-hover:text-[#ff7675] transition-colors line-clamp-1">{p.title}</p>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">
                    {p.createdAt?.seconds ? format(new Date(p.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-8 bg-[#ff7675] rounded-[40px] text-white space-y-4">
            <h3 className="text-xl font-bold">Subscribe</h3>
            <p className="text-white/80 text-sm leading-relaxed">Get notified when I post something new about learning and life.</p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
              />
              <button className="w-full py-3 bg-white text-[#ff7675] rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95">
                Join Newsletter
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Create New Post</h2>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleAddPost} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Title</label>
                <input 
                  type="text" placeholder="Enter post title..." required
                  value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-[24px] border-none focus:ring-2 focus:ring-red-100 text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Excerpt</label>
                <input 
                  type="text" placeholder="Short summary of the post..." required
                  value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-[24px] border-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Tags (Comma separated)</label>
                <input 
                  type="text" placeholder="tag1, tag2, tag3"
                  value={newPost.tags} onChange={e => setNewPost({...newPost, tags: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-[24px] border-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Content (Markdown)</label>
                <textarea 
                  placeholder="Write your thoughts here..." required
                  value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full h-80 p-6 bg-gray-50 rounded-[32px] border-none focus:ring-2 focus:ring-red-100 resize-none font-mono text-sm leading-relaxed"
                />
              </div>
              <button className="w-full py-5 bg-[#ff7675] text-white rounded-[24px] font-bold text-lg hover:bg-[#ee5253] shadow-xl shadow-red-100 transition-all active:scale-[0.98]">
                Publish Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
