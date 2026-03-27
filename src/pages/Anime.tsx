import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Anime } from '../types';
import { Star, Tv, ExternalLink, Info } from 'lucide-react';

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
  const [bilibiliLoading, setBilibiliLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bilibili' | 'shelf'>('bilibili');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBilibili = async (page: number) => {
    setBilibiliLoading(true);
    try {
      const response = await fetch(`/api/bilibili/anime?ps=30&pn=${page}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
        return;
      }
      const result = await response.json();
      
      if (result.code === 0 && result.data?.list) {
        setBilibiliAnime(result.data.list);
        const total = result.data.total || 0;
        setTotalPages(Math.ceil(total / 30));
        setError(null);
      } else {
        setError(result.message || "Failed to fetch Bilibili anime list");
      }
    } catch (error) {
      console.error("Error fetching Bilibili anime:", error);
      setError("Network error or server unavailable");
    } finally {
      setBilibiliLoading(false);
    }
  };

  useEffect(() => {
    // Fetch Shelf Anime (Firebase)
    const q = query(collection(db, 'anime'), orderBy('createdAt', 'desc'));
    const unsubscribeShelf = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setShelfAnime(data);
      setLoading(false);
    });

    return () => { unsubscribeShelf(); };
  }, []);

  useEffect(() => {
    if (activeTab === 'bilibili') {
      fetchBilibili(currentPage);
    }
  }, [currentPage, activeTab]);

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
      </header>

      {activeTab === 'bilibili' ? (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in duration-300">
              <Info size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bilibiliLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
              ))
            ) : bilibiliAnime.length === 0 && !error ? (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                disabled={currentPage === 1 || bilibiliLoading}
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:border-[#ff7675] hover:text-[#ff7675] transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-[#ff7675] text-white shadow-lg shadow-red-100' 
                          : 'bg-white border border-gray-200 text-gray-500 hover:border-[#ff7675] hover:text-[#ff7675]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={currentPage === totalPages || bilibiliLoading}
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:border-[#ff7675] hover:text-[#ff7675] transition-all"
              >
                Next
              </button>
            </div>
          )}
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
