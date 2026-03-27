import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Anime } from '../types';
import { Star, Tv, Plus, X, ExternalLink, Play, Info } from 'lucide-react';

interface BilibiliAnime {
  title: string;
  cover: string;
  evaluate: string;
  new_ep: {
    index_show: string;
  };
  progress: string;
  rating?: {
    score: number;
  };
  url: string;
  season_id: number;
}

export const AnimeList: React.FC = () => {
  const [bilibiliAnime, setBilibiliAnime] = useState<BilibiliAnime[]>([]);
  const [shelfAnime, setShelfAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnime, setNewAnime] = useState({ name: '', imageUrl: '', score: 8, comment: '' });
  const [activeTab, setActiveTab] = useState<'bilibili' | 'shelf'>('bilibili');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Bilibili Anime
    const fetchBilibili = async () => {
      try {
        const response = await fetch('/api/bilibili/anime?ps=30');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || `Server error: ${response.status}`);
          return;
        }
        const result = await response.json();
        if (result.code === 0 && result.data?.list) {
          setBilibiliAnime(result.data.list);
          setError(null);
        } else {
          setError(result.message || "Failed to fetch Bilibili anime list");
        }
      } catch (error) {
        console.error("Error fetching Bilibili anime:", error);
        setError("Network error or server unavailable");
      }
    };

    // Fetch Shelf Anime (Firebase)
    const q = query(collection(db, 'anime'), orderBy('createdAt', 'desc'));
    const unsubscribeShelf = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setShelfAnime(data);
      setLoading(false);
    });

    fetchBilibili();

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setIsAdmin(user?.email === 'firsticychen@gmail.com');
    });

    return () => { unsubscribeShelf(); unsubscribeAuth(); };
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

  if (loading && shelfAnime.length === 0 && bilibiliAnime.length === 0) {
    return <div className="text-center py-20">Loading anime list...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Anime Wall</h1>
          <p className="text-gray-500">Tracking my anime journey from Bilibili and personal ratings.</p>
          
          <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('bilibili')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'bilibili' ? 'bg-white shadow-sm text-[#ff7675]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bilibili Wall
            </button>
            <button
              onClick={() => setActiveTab('shelf')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shelf' ? 'bg-white shadow-sm text-[#ff7675]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Shelf
            </button>
          </div>
        </div>
        
        {isAdmin && activeTab === 'shelf' && (
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

      {activeTab === 'bilibili' ? (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in duration-300">
              <Info size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bilibiliAnime.length === 0 && !error ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Tv className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-400">No Bilibili anime found. Check your UID in settings.</p>
              </div>
            ) : (
              bilibiliAnime.map((item) => (
              <div key={item.season_id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={item.cover} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-xs line-clamp-3 mb-2">{item.evaluate}</p>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-bold hover:bg-white/30 transition-all"
                    >
                      <ExternalLink size={12} /> View on Bilibili
                    </a>
                  </div>
                  {item.rating && (
                    <div className="absolute top-2 right-2 bg-[#ff7675] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star size={10} className="fill-white" />
                      <span className="text-[10px] font-bold">{item.rating.score}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                  <h3 className="text-sm font-bold line-clamp-1 group-hover:text-[#ff7675] transition-colors">{item.title}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{item.progress || 'No progress'}</span>
                      <span>{item.new_ep?.index_show || 'Unknown'}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#ff7675] rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (parseInt(item.progress?.match(/\d+/)?.[0] || '0') / (parseInt(item.new_ep?.index_show?.match(/\d+/)?.[0] || '0') || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {shelfAnime.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Tv className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400">No anime added to shelf yet.</p>
            </div>
          ) : (
            shelfAnime.map((item) => (
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
      )}
    </div>
  );
};
