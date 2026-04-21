import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigation, siteProfile, socialLinks } from '../content/site';
import { setupRevealOnScroll } from '../lib/reveal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setupRevealOnScroll();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={siteProfile.avatar}
                alt=""
                className="w-9 h-9 rounded-lg object-cover bg-[#ff7675] group-hover:rotate-6 transition-transform"
              />
              <span className="font-bold text-xl tracking-tight">{siteProfile.name}</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#ff7675] ${
                      isActive ? 'text-[#ff7675]' : 'text-gray-500'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div id="mobile-navigation" className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive ? 'bg-red-50 text-[#ff7675]' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            (c) {new Date().getFullYear()} {siteProfile.name}. Built with local Markdown and React.
          </p>
          <div className="flex justify-center items-center gap-6 mt-4">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#ff7675] transition-colors"
                aria-label={link.label}
              >
                <link.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
