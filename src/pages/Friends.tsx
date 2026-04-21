import React from 'react';
import { friends } from '../content/friends';
import { ExternalLink, Heart, Link2 } from 'lucide-react';

const PanelHeader: React.FC<{ title: string; meta?: string }> = ({ title, meta }) => (
  <div className="terminal-panel-title flex items-center justify-between px-4 py-3 font-mono text-xs">
    <span>{title}</span>
    {meta && <span className="text-[var(--color-primary)]">{meta}</span>}
  </div>
);

const getDisplayUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.host;
  } catch {
    return url;
  }
};

export const Friends: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="~/friends/links.json" meta={`${friends.length} links`} />
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <p className="terminal-prompt font-mono text-sm text-[var(--color-text)]">cat ./friends --public</p>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)]">Friends</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--color-muted)]">
                Personal links and small web corners from people I want to keep close on the open web.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-xs">
            <p className="text-[var(--color-muted)]">status</p>
            <p className="mt-1 text-lg font-black text-[var(--color-text)]">public</p>
          </div>
        </div>
      </header>

      <section className="reveal terminal-panel overflow-hidden">
        <PanelHeader title="friend-links" meta={friends.length ? 'external' : 'empty'} />

        {friends.length === 0 ? (
          <div className="m-4 rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
            <Heart className="mx-auto mb-4 text-[var(--color-muted)]" size={44} />
            <p className="font-mono text-sm text-[var(--color-muted)]">No friends added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => (
              <a
                key={friend.id}
                href={friend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive group flex min-w-0 gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
              >
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]">
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Link2 size={24} className="text-[var(--color-primary)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="truncate text-lg font-black text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                      {friend.name}
                    </h2>
                    <ExternalLink size={16} className="mt-1 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-[var(--color-primary)]">
                    https://{getDisplayUrl(friend.url)}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">
                    {friend.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
