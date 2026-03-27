import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Github, User, BookOpen, Tv, Heart, Lock, LogIn, LogOut, WifiOff, Wifi } from 'lucide-react';
import { auth, signIn, logOut, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    
    // Check Firestore connectivity
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'posts', 'test-connection'));
        setIsOnline(true);
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          setIsOnline(false);
        } else {
          setIsOnline(true); // Permission denied or other errors mean we reached the server
        }
      }
    };
    checkConnection();

    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: User },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Anime', path: '/anime', icon: Tv },
    { name: 'Diary', path: '/diary', icon: Lock },
    { name: 'Friends', path: '/friends', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#2d3436] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#ff7675] rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
                C
              </div>
              <span className="font-bold text-xl tracking-tight">Citrus</span>
            </Link>

            {/* Connection Status Indicator */}
            {isOnline === false && (
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-bold animate-pulse hover:bg-red-100 transition-colors"
                title="Click to retry connection"
              >
                <WifiOff size={12} /> Offline (Retry?)
              </button>
            )}

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
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
              
              {user ? (
                <button
                  onClick={logOut}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#ff7675] transition-colors"
                >
                  <LogIn size={16} />
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
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
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={() => { logOut(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { signIn(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <LogIn size={20} />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Citrus Blog. Built with Astro-like vibes.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
