import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Terminal, X } from 'lucide-react';
import { navigation, siteProfile, socialLinks } from '../content/site';
import { setupRevealOnScroll } from '../lib/reveal';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setupRevealOnScroll();
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <Link to="/" className="interactive group flex min-w-0 items-center gap-3 no-underline">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent-strong)]">
                <Terminal size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-sm font-bold text-[var(--color-text)]">
                  ~/chen1ice
                </span>
                <span className="block truncate font-mono text-xs text-[var(--color-muted)]">
                  {siteProfile.name}
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <nav aria-label="Primary navigation" className="flex items-center gap-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `interactive inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                      }`
                    }
                  >
                    <item.icon size={14} />
                    {item.name.toLowerCase()}
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                onClick={toggleTheme}
                className="interactive inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="interactive inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="interactive inline-flex size-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid gap-2 pb-4 md:hidden">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `interactive flex items-center gap-3 rounded-lg border px-3 py-3 font-mono text-sm font-semibold ${
                      isActive
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.name.toLowerCase()}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 font-mono text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            <span className="text-[var(--color-accent-strong)]">$</span> echo "(c) {new Date().getFullYear()} {siteProfile.name}"
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive text-[var(--color-muted)] hover:text-[var(--color-text)]"
                aria-label={link.label}
              >
                <link.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
