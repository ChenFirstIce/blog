import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { format } from 'date-fns';
import { Github, GraduationCap, Trophy, Calendar, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setLatestPosts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Hero Section (Self Introduction) */}
      <section className="flex flex-col md:flex-row items-center gap-10 pt-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Hi, I'm <span className="text-[#ff7675]">Chen1Ice</span> 👋
            </h1>
            <p className="text-xl text-gray-400 font-medium">CS Student & Anime Lover</p>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            A passionate computer science student exploring the intersection of code and creativity. 
            I love building things that make a difference, watching seasonal anime, and documenting my journey.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200"
            >
              <Github size={20} />
              GitHub Profile
            </a>
            <Link 
              to="/blog" 
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl hover:border-[#ff7675] hover:text-[#ff7675] transition-all"
            >
              Read Blog
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7675] to-[#fab1a0] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            <img 
              src="https://picsum.photos/seed/chen1ice-avatar/400/400" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 2. GitHub Contribution Wall */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-[#ff7675]" />
            GitHub Contributions
          </h2>
          <span className="text-sm text-gray-400 font-mono">@firsticychen</span>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <img 
            src="https://ghchart.rshah.org/ff7675/firsticychen" 
            alt="GitHub Contributions" 
            className="w-full min-w-[700px]"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* 3. Latest Posts (Top 3) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-[#ff7675]" />
            Latest Posts
          </h2>
          <Link to="/blog" className="text-sm font-bold text-[#ff7675] hover:underline flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid gap-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading latest posts...</div>
          ) : latestPosts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
              No posts published yet.
            </div>
          ) : (
            latestPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {post.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] text-gray-300 font-bold">#{tag}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-[#ff7675] transition-colors">
                      {post.title}
                    </h3>
                  </div>
                <div className="mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#ff7675]">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 4. Education & Honors */}
      <section className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="text-[#ff7675]" />
            Education
          </h2>
          <div className="space-y-4">
            <div className="relative pl-8 border-l-2 border-gray-100 space-y-1">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#ff7675]"></div>
              <h3 className="font-bold text-lg">Computer Science & Technology</h3>
              <p className="text-gray-600">University Name</p>
              <p className="text-sm text-gray-400 font-medium">2022 - 2026</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-[#ff7675]" />
            Honors
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-bold">First Prize Scholarship</h3>
                <p className="text-sm text-gray-500">Academic Excellence • 2023</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-bold">ACM-ICPC Regional Bronze</h3>
                <p className="text-sm text-gray-500">Competitive Programming • 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
