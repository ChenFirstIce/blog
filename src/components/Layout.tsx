import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Github, User, BookOpen, Tv, Heart, WifiOff, LogIn, LogOut } from 'lucide-react';
import { db, auth, signIn, logOut } from '../firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();

  const ADMIN_EMAIL = 'firsticychen@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signIn();
      if (!result) {
        // User closed popup or other non-error cancellation
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Login popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setAuthError(error.message || 'An error occurred during login.');
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
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
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: User },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Anime', path: '/anime', icon: Tv },
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
              <span className="font-bold text-xl tracking-tight">Chen1Ice</span>
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
            © {new Date().getFullYear()} Chen1Ice Blog. Built with Astro-like vibes.
          </p>
          <div className="flex flex-col items-center gap-4 mt-4">
            {authError && (
              <div className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold animate-in fade-in zoom-in duration-300 flex items-center gap-2">
                <WifiOff size={12} /> {authError}
                <button 
                  onClick={() => setAuthError(null)}
                  className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex justify-center items-center gap-6">
              {isAuthReady && (
                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isAdmin ? 'text-[#ff7675]' : 'text-gray-400'}`}>
                        {isAdmin ? 'Admin' : 'Guest'}
                      </span>
                      <button 
                        onClick={() => logOut()} 
                        className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                        title="Logout"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSignIn} 
                      className="text-[10px] font-bold text-gray-300 hover:text-gray-400 uppercase tracking-widest transition-colors"
                    >
                      Admin Login
                    </button>
                  )}
                </div>
              )}
              <div className="w-px h-3 bg-gray-100"></div>
              <a href="https://github.com/ChenFirstIce" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
