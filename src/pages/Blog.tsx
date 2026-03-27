import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, Plus, X, Tag as TagIcon, ListFilter, Upload, Image as ImageIcon, FileText, Trash2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

export const Blog: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', excerpt: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const ADMIN_EMAIL = 'firsticychen@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
      setLoading(false);
    });

    return () => { unsubscribe(); };
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mdFile = Array.from(files).find(f => f.name.endsWith('.md'));
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (!mdFile) {
      alert("Please select at least one .md file.");
      return;
    }

    setUploadProgress("Reading Markdown...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      let content = event.target?.result as string;
      
      // Basic title extraction from first H1
      const titleMatch = content.match(/^#\s+(.*)$/m);
      const title = titleMatch ? titleMatch[1] : mdFile.name.replace('.md', '');
      
      // Basic excerpt extraction (first paragraph)
      const excerpt = content.replace(/^#\s+.*$/m, '').trim().split('\n')[0].slice(0, 150) + '...';

      if (imageFiles.length > 0) {
        setUploadProgress(`Uploading ${imageFiles.length} images...`);
        for (const img of imageFiles) {
          try {
            const storageRef = ref(storage, `blog-images/${Date.now()}-${img.name}`);
            const snapshot = await uploadBytes(storageRef, img);
            const url = await getDownloadURL(snapshot.ref);
            
            // Replace local paths like ./images/name.png or images/name.png with the Firebase URL
            const escapedName = img.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // 1. Handle Markdown style: ![alt](./images/name.png)
            const mdRegex = new RegExp(`(!\\[.*?\\]\\()(\\./)?(images/)?${escapedName}(\\))`, 'g');
            content = content.replace(mdRegex, `$1${url}$4`);

            // 2. Handle HTML style: <img src="./images/name.png" ... />
            const htmlRegex = new RegExp(`(<img\\s+[^>]*src=["'])(\\./)?(images/)?${escapedName}(["'][^>]*>)`, 'g');
            content = content.replace(htmlRegex, `$1${url}$4`);
          } catch (err) {
            console.error("Error uploading image:", img.name, err);
          }
        }
      }

      setNewPost({
        title,
        excerpt,
        content: content.replace(/^#\s+.*$/m, '').trim(), // Remove the H1 title from content
        tags: ''
      });
      setUploadProgress(null);
    };
    reader.readAsText(mdFile);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const path = 'posts';
    try {
      const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      await addDoc(collection(db, path), {
        ...newPost,
        tags: tagsArray,
        createdAt: serverTimestamp()
      });
      setShowNewPostModal(false);
      setNewPost({ title: '', excerpt: '', content: '', tags: '' });
    } catch (error) {
      console.error("Error creating post:", error);
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete || !isAdmin) return;
    setIsDeleting(true);
    const path = `posts/${postToDelete}`;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete));
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setIsDeleting(false);
    }
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
            onClick={() => setShowNewPostModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff7675] text-white rounded-2xl font-bold hover:bg-[#ff5e5d] transition-all shadow-lg shadow-red-100 active:scale-95"
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
              <div key={post.id} className="relative group">
                <Link 
                  to={`/blog/${post.id}`}
                  className="block p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-50/50 transition-all hover:-translate-y-1"
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
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPostToDelete(post.id!);
                    }}
                    className="absolute top-8 right-8 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Post"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
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

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Post</h2>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold transition-all">
                  <Upload size={16} />
                  <span>Import MD & Images</span>
                  <input 
                    type="file" 
                    multiple 
                    accept=".md,image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
                <button onClick={() => setShowNewPostModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            {uploadProgress && (
              <div className="px-8 py-2 bg-blue-50 text-blue-600 text-xs font-bold animate-pulse">
                {uploadProgress}
              </div>
            )}
            <form onSubmit={handleCreatePost} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Title</label>
                <input 
                  required
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#ff7675] transition-all"
                  placeholder="Enter post title..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Excerpt</label>
                <textarea 
                  required
                  value={newPost.excerpt}
                  onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#ff7675] transition-all h-24 resize-none"
                  placeholder="Brief summary of the post..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tags (comma separated)</label>
                <input 
                  value={newPost.tags}
                  onChange={e => setNewPost({...newPost, tags: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#ff7675] transition-all"
                  placeholder="e.g. React, Design, Life"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Content (Markdown)</label>
                <textarea 
                  required
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#ff7675] transition-all h-64 resize-none font-mono text-sm"
                  placeholder="Write your post content in Markdown..."
                />
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full py-4 bg-[#ff7675] text-white rounded-2xl font-bold hover:bg-[#ff5e5d] transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Publish Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
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
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
