import React from 'react';
import { friends } from '../content/friends';
import { ExternalLink, Heart } from 'lucide-react';

export const Friends: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Friends</h1>
          <p className="text-gray-500">Awesome people I've met along the way.</p>
        </div>
      </header>

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
