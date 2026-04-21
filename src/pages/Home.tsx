import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Trophy } from 'lucide-react';
import { education, honors, siteProfile } from '../content/site';
import { getRecentPosts } from '../lib/posts';

export const Home: React.FC = () => {
  const latestPosts = getRecentPosts();

  return (
    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="reveal flex flex-col md:flex-row items-center gap-10 pt-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Hi, I'm <span className="text-[#ff7675]">{siteProfile.name}</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">{siteProfile.role}</p>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            {siteProfile.intro}
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7675] to-[#fab1a0] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            <img
              src={siteProfile.avatar}
              alt={`${siteProfile.name} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="reveal space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-[#ff7675]" />
            Latest Posts
          </h2>
          <Link to="/blog" className="text-sm font-bold text-[#ff7675] hover:underline flex items-center gap-1 shrink-0">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6">
          {latestPosts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
              No posts published yet.
            </div>
          ) : (
            latestPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="interactive group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag.slug} className="text-xs text-gray-500 font-semibold">
                          #{tag.label}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-[#ff7675] transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  )}
                </div>
                <div className="text-[#ff7675] md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="reveal grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="text-[#ff7675]" />
            Education
          </h2>
          <div className="space-y-4">
            {education.map((item) => (
              <div key={`${item.school}-${item.period}`} className="relative pl-8 border-l-2 border-gray-100 space-y-1">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#ff7675]"></div>
                <h3 className="font-bold text-lg">{item.major}</h3>
                <p className="text-gray-600">{item.school}</p>
                <p className="text-sm text-gray-400 font-medium">{item.period}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-[#ff7675]" />
            Honors
          </h2>
          <div className="space-y-6">
            {honors.map((item) => (
              <div key={item.title} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
