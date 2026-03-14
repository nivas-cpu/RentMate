import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home, Search, Users, LogIn, UserPlus, Menu, X, Building2, LogOut, Inbox as InboxIcon, PlusSquare, UserIcon, Heart } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Properties', to: '/properties', icon: Search },
    { label: 'Housemates', to: '/housemates', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-primary-600 transition-all duration-300 group-hover:scale-110">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-surface-900">
              Rent<span className="text-primary-500">Mate</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `no-underline flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-surface-600 hover:text-primary-600 hover:bg-surface-100'
                    }`
                  }
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1"></div>
            {isAuthenticated ? (
              <>
                <Link to="/properties/new" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 hidden lg:flex">
                  <PlusSquare className="w-3.5 h-3.5" /> List Property
                </Link>
                <Link to="/housemates/new" className="btn-outline border-accent-300 text-accent-700 hover:bg-accent-50 text-xs py-2 px-4 flex items-center gap-1.5 hidden lg:flex">
                  <UserPlus className="w-3.5 h-3.5" /> Find Room
                </Link>
                <Link to="/inbox" className="btn-ghost text-sm font-semibold flex items-center gap-2 group ml-2">
                  <InboxIcon className="w-4 h-4" />
                  Inbox
                </Link>
                <div className="w-px h-6 bg-surface-200 mx-1"></div>
                <span className="text-sm font-semibold text-surface-700">Hi, {user?.user_metadata?.full_name || user?.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-ghost text-sm font-semibold flex items-center gap-2 group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm font-semibold flex items-center gap-2 group">
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              id="mobile-menu-btn"
              className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-surface-100 px-4 py-6 space-y-4 animate-fade-in mx-4 mb-4 rounded-2xl shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `no-underline flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-surface-600 hover:bg-primary-50 hover:text-primary-600'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/properties/new" 
                  onClick={() => setMenuOpen(false)} 
                  className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  List Property
                </Link>
                <Link 
                  to="/housemates/new" 
                  onClick={() => setMenuOpen(false)} 
                  className="btn-outline border-accent-300 text-accent-700 hover:bg-accent-50 text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  Find Room
                </Link>
                 <Link 
                  to="/inbox" 
                  onClick={() => setMenuOpen(false)} 
                  className="btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <InboxIcon className="w-4 h-4" />
                  Inbox
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <span className="text-sm font-semibold text-surface-700 flex items-center justify-center col-span-2">
                  Hi, {user?.user_metadata?.full_name || user?.email}
                </span>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMenuOpen(false)} 
                  className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
