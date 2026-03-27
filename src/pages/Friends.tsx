import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Friend } from '../types';
import { ExternalLink, Heart, Plus, X } from 'lucide-react';

export const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriend, setNewFriend] = useState({ name: '', url: '', description: '', avatar: '' });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'friends'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friend));
      setFriends(data);
      setLoading(false);
    });

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setIsAdmin(user?.email === 'firsticychen@gmail.com');
    });

    return () => { unsubscribe(); unsubscribeAuth(); };
  }, []);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'friends'), {
      ...newFriend,
      createdAt: serverTimestamp()
    });
    setShowAddModal(false);
    setNewFriend({ name: '', url: '', description: '', avatar: '' });
  };

  if (loading) return <div className="text-center py-20">Loading friends...</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Friends</h1>
          <p className="text-gray-500">Awesome people I've met along the way.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff7675] text-white rounded-full font-bold hover:bg-[#ee5253] transition-all"
          >
            <Plus size={18} /> Add Friend
          </button>
        )}
      </header>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add Friend</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <input 
                type="text" placeholder="Friend Name" required
                value={newFriend.name} onChange={e => setNewFriend({...newFriend, name: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100"
              />
              <input 
                type="url" placeholder="Website URL" required
                value={newFriend.url} onChange={e => setNewFriend({...newFriend, url: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100"
              />
              <input 
                type="url" placeholder="Avatar URL (Optional)"
                value={newFriend.avatar} onChange={e => setNewFriend({...newFriend, avatar: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100"
              />
              <textarea 
                placeholder="Description" required
                value={newFriend.description} onChange={e => setNewFriend({...newFriend, description: e.target.value})}
                className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-100 resize-none"
              />
              <button className="w-full py-4 bg-[#ff7675] text-white rounded-2xl font-bold hover:bg-[#ee5253] transition-all">
                Add Friend
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Heart className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400">No friends added yet.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <a 
              key={friend.id} 
              href={friend.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg group-hover:rotate-6 transition-transform">
                <img 
                  src={friend.avatar || `https://picsum.photos/seed/${friend.name}/200/200`} 
                  alt={friend.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold group-hover:text-[#ff7675] transition-colors flex items-center justify-center gap-1">
                  {friend.name} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">{friend.description}</p>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};
