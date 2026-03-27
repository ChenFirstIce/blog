import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Anime } from '../types';
import { Star, Tv, Plus, X } from 'lucide-react';

export const AnimeList: React.FC = () => {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnime, setNewAnime] = useState({ name: '', imageUrl: '', score: 8, comment: '' });

  useEffect(() => {
    const q = query(collection(db, 'anime'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setAnime(data);
      setLoading(false);
    });

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setIsAdmin(user?.email === 'firsticychen@gmail.com');
    });

    return () => { unsubscribe(); unsubscribeAuth(); };
  }, []);

  const handleAddAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'anime'), {
      ...newAnime,
      createdAt: serverTimestamp()
    });
    setShowAddModal(false);
    setNewAnime({ name: '', imageUrl: '', score: 8, comment: '' });
  };

  if (loading) return <div className="text-center py-20">Loading anime list...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Anime Shelf</h1>
          <p className="text-gray-500">My personal collection of watched anime and ratings.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff7675] text-white rounded-full font-bold hover:bg-[#ee5253] transition-all"
          >
            <Plus size={18} /> Add Anime
          </button>
        )}
      </header>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add Anime</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddAnime} className="space-y-4">
              <input 
                type="text" placeholder="Anime Name" required
                value={newAnime.name} onChange={e => setNewAnime({...newAnime, name: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100"
              />
              <input 
                type="url" placeholder="Image URL" required
                value={newAnime.imageUrl} onChange={e => setNewAnime({...newAnime, imageUrl: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100"
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500">Score: {newAnime.score}</label>
                <input 
                  type="range" min="0" max="10" step="0.5"
                  value={newAnime.score} onChange={e => setNewAnime({...newAnime, score: parseFloat(e.target.value)})}
                  className="w-full accent-[#ff7675]"
                />
              </div>
              <textarea 
                placeholder="Comment" required
                value={newAnime.comment} onChange={e => setNewAnime({...newAnime, comment: e.target.value})}
                className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100 resize-none"
              />
              <button className="w-full py-4 bg-[#ff7675] text-white rounded-2xl font-bold hover:bg-[#ee5253] transition-all">
                Add to Shelf
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {anime.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Tv className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400">No anime added yet.</p>
          </div>
        ) : (
          anime.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">{item.score}</span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold group-hover:text-[#ff7675] transition-colors">{item.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 italic">
                  "{item.comment}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
