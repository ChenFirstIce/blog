import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Info, Loader2, Star, Tv } from 'lucide-react';
import { setupRevealOnScroll } from '../lib/reveal';

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

const PanelHeader: React.FC<{ title: string; meta?: string }> = ({ title, meta }) => (
  <div className="terminal-panel-title flex items-center justify-between px-4 py-3 font-mono text-xs">
    <span>{title}</span>
    {meta && <span className="text-[var(--color-primary)]">{meta}</span>}
  </div>
);

export const AnimeList: React.FC = () => {
  const [bilibiliAnime, setBilibiliAnime] = useState<BilibiliAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [bilibiliLoading, setBilibiliLoading] = useState(false);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilibili(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!loading) {
      setupRevealOnScroll();
    }
  }, [loading, bilibiliAnime.length, error]);

  const secureImageUrl = (url: string) => url.replace(/^http:\/\//, 'https://');

  const getProgressPercent = (item: BilibiliAnime) => {
    const current = Number.parseInt(item.progress?.match(/\d+/)?.[0] || '0', 10);
    const total = Number.parseInt(item.new_ep?.index_show?.match(/\d+/)?.[0] || '0', 10);
    if (!current || !total) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  };

  if (loading && bilibiliAnime.length === 0) {
    return (
      <div className="terminal-panel mx-auto max-w-3xl overflow-hidden">
        <PanelHeader title="anime-wall" meta="loading" />
        <div className="flex items-center justify-center gap-3 p-10 font-mono text-sm text-[var(--color-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--color-primary)]" />
          <span>fetch /api/bilibili/anime</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="~/anime/index.json" meta="bilibili source" />
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <p className="terminal-prompt font-mono text-sm text-[var(--color-text)]">anime-wall --source bilibili</p>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)]">Anime Wall</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--color-muted)]">
                A compact Bilibili archive for followed series, watch progress, ratings, and quick jumps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
              <p className="text-[var(--color-muted)]">items</p>
              <p className="mt-1 text-lg font-black text-[var(--color-text)]">{bilibiliAnime.length}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
              <p className="text-[var(--color-muted)]">page</p>
              <p className="mt-1 text-lg font-black text-[var(--color-text)]">{currentPage}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
              <p className="text-[var(--color-muted)]">total</p>
              <p className="mt-1 text-lg font-black text-[var(--color-text)]">{totalPages}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="watch-list" meta={bilibiliLoading ? 'syncing' : `${bilibiliAnime.length} matched`} />

        {error && (
          <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 animate-in fade-in duration-300">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-xs font-bold uppercase">request failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
          {bilibiliLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="aspect-[3/4] animate-pulse bg-[var(--color-background)]" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-background)]" />
                  <div className="h-2 w-full animate-pulse rounded bg-[var(--color-background)]" />
                </div>
              </div>
            ))
          ) : bilibiliAnime.length === 0 && !error ? (
            <div className="col-span-full rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
              <Tv className="mx-auto mb-4 text-[var(--color-muted)]" size={44} />
              <p className="font-mono text-sm text-[var(--color-muted)]">No Bilibili anime found. Check your UID in settings.</p>
            </div>
          ) : (
            bilibiliAnime.map((item) => (
              <article
                key={item.season_id}
                className="interactive group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-primary)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-background)]">
                  <img
                    src={secureImageUrl(item.cover)}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute left-2 top-2 rounded-md border border-white/20 bg-black/65 px-2 py-1 font-mono text-[10px] font-bold uppercase text-white backdrop-blur">
                    {item.progress || 'No progress'}
                  </div>
                  {item.rating && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-[var(--color-primary)] px-2 py-1 font-mono text-[10px] font-black text-[var(--color-primary-contrast)]">
                      <Star size={10} className="fill-current" />
                      <span>{item.rating.score}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/65 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-3 text-xs leading-5 text-white/90">{item.evaluate || 'No summary available.'}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/15 px-3 font-mono text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/25"
                    >
                      <ExternalLink size={13} /> open bilibili
                    </a>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3 p-3">
                  <div>
                    <h2 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                      {item.title}
                    </h2>
                    <p className="mt-2 line-clamp-1 font-mono text-[10px] text-[var(--color-muted)]">
                      {item.new_ep?.index_show || 'Unknown episode'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[var(--color-muted)]">
                      <span>progress</span>
                      <span>{getProgressPercent(item)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-background)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)]"
                        style={{ width: `${getProgressPercent(item)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] p-4 sm:flex-row">
            <button
              type="button"
              disabled={currentPage === 1 || bilibiliLoading}
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 font-mono text-sm font-bold text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2">
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
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`grid size-11 place-items-center rounded-lg border font-mono text-sm font-black transition-colors ${
                      currentPage === pageNum
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages || bilibiliLoading}
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="interactive inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 font-mono text-sm font-bold text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
