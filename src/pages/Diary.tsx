import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, signIn } from '../firebase';
import { Diary } from '../types';
import { format } from 'date-fns';
import { Lock, Plus, Send, ShieldAlert } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

export const DiaryPage: React.FC = () => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'diaries'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diary));
      setDiaries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEntry.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'diaries'), {
        content: newEntry,
        isPrivate: true,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewEntry('');
    } catch (error) {
      console.error('Error adding diary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading diary...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-[#ff7675]">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl font-bold">Private Space</h1>
        <p className="text-gray-500">This section is for my private diaries. Please login to view your entries.</p>
        <button 
          onClick={signIn}
          className="px-8 py-3 bg-[#ff7675] text-white rounded-full font-bold hover:bg-[#ee5253] transition-all shadow-lg hover:shadow-red-200"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            Diary <ShieldAlert className="text-[#ff7675]" size={28} />
          </h1>
          <p className="text-gray-500">Private thoughts and daily reflections.</p>
        </div>
      </header>

      {/* New Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="What's on your mind today?"
          className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100 resize-none transition-all"
        />
        <div className="flex justify-end">
          <button
            disabled={isSubmitting || !newEntry.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-[#ff7675] text-white rounded-full font-bold disabled:opacity-50 hover:bg-[#ee5253] transition-all"
          >
            {isSubmitting ? 'Posting...' : <><Send size={18} /> Post Entry</>}
          </button>
        </div>
      </form>

      {/* Diary Entries */}
      <div className="space-y-6">
        {diaries.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No entries yet. Start writing!</p>
        ) : (
          diaries.map((entry) => (
            <div key={entry.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="font-bold uppercase tracking-widest">
                  {entry.createdAt?.seconds ? format(new Date(entry.createdAt.seconds * 1000), 'EEEE, MMM d') : 'Just now'}
                </span>
                <Lock size={12} />
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
