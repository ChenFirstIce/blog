import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, ListFilter, Tag as TagIcon, X } from 'lucide-react';
import { allPosts, categories, getPostsByCategory, getPostsByTag, tags } from '../lib/posts';

export const Blog: React.FC = () => {
  const { tagSlug, categorySlug } = useParams<{ tagSlug?: string; categorySlug?: string }>();
  const navigate = useNavigate();

  const filteredPosts = useMemo(() => {
    if (tagSlug) return getPostsByTag(tagSlug);
    if (categorySlug) return getPostsByCategory(categorySlug);
    return allPosts;
  }, [tagSlug, categorySlug]);

  const activeTag = tags.find((tag) => tag.slug === tagSlug);
  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const isFiltered = Boolean(activeTag || activeCategory || tagSlug || categorySlug);
  const activeFilterLabel = tagSlug
    ? `#${activeTag?.label ?? tagSlug}`
    : activeCategory?.label ?? categorySlug;

  const emptyMessage =
    allPosts.length === 0
      ? 'No posts published yet.'
      : activeTag
        ? `No posts found for #${activeTag.label}.`
        : activeCategory
          ? `No posts found in ${activeCategory.label}.`
          : 'No posts found for this filter.';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-gray-500">Sharing my learning journey and random thoughts.</p>
        </div>
      </header>

      {isFiltered && (
        <div className="reveal flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-[#ff7675] rounded-xl text-sm font-bold animate-in fade-in zoom-in duration-300">
            {tagSlug ? <TagIcon size={14} /> : <ListFilter size={14} />}
            <span>
              Filtering by: {activeFilterLabel}
            </span>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
              aria-label="Clear blog filter"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="reveal flex-1 space-y-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <BookOpen className="mx-auto text-gray-200 mb-6" size={64} />
              <p className="text-gray-400 font-medium">{emptyMessage}</p>
              {isFiltered && (
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 mt-4 text-[#ff7675] font-bold hover:underline"
                >
                  View all posts <ChevronRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="interactive block p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-50/50 transition-all hover:-translate-y-1 group"
              >
                <article>
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${
                          post.categorySlug === categorySlug ? 'text-[#ff7675]' : 'text-gray-400'
                        }`}
                      >
                        {post.category}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.slug}
                            className={`text-[10px] font-bold ${
                              tag.slug === tagSlug ? 'text-[#ff7675]' : 'text-gray-400'
                            }`}
                          >
                            #{tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                      {post.date}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold mb-4 leading-tight group-hover:text-[#ff7675] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 line-clamp-2 mb-8 text-lg leading-relaxed">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[#ff7675] uppercase tracking-widest">
                    Read Article <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </article>
                </Link>
            ))
          )}
        </div>

        <aside className="reveal w-full lg:w-80 space-y-10">
          <section className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <ListFilter size={20} className="text-[#ff7675]" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No categories yet.</p>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/blog/category/${category.slug}`}
                    className={`flex items-center justify-between gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all active:scale-95 ${
                      category.slug === categorySlug
                        ? 'bg-[#ff7675] text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-[#ff7675] hover:text-white'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="text-xs opacity-70">{category.count}</span>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <TagIcon size={20} className="text-[#ff7675]" />
              All Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No tags yet.</p>
              ) : (
                tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    to={`/blog/tag/${tag.slug}`}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                      tag.slug === tagSlug
                        ? 'bg-[#ff7675] text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-[#ff7675] hover:text-white'
                    }`}
                  >
                    #{tag.label}
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <BookOpen size={20} className="text-[#ff7675]" />
              Recent Posts
            </h3>
            <div className="space-y-4">
              {allPosts.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No posts yet.</p>
              ) : (
                allPosts.slice(0, 5).map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                    <p className="text-sm font-bold group-hover:text-[#ff7675] transition-colors line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">
                      {post.date}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
