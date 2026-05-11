import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '⬡' },
  { to: '/logs',       label: 'Logs',       icon: '◈' },
  { to: '/activities', label: 'Activities', icon: '⚡' },
  { to: '/roadmap',    label: 'Roadmap',    icon: '◎' },
  { to: '/analytics',  label: 'Analytics',  icon: '◑' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="font-mono text-cyan-500 text-lg font-bold tracking-tighter">DevTrack</span>
          <span className="hidden sm:block font-mono text-slate-600 text-xs">v3.0</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}>
              <span className="text-xs">{icon}</span>
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700
                       hover:border-slate-500 text-slate-400 hover:text-white transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀' : '◐'}
          </button>

          {/* Profile link */}
          <NavLink to="/profile"
            className={({ isActive }) =>
              `hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}>
            {user?.name?.split(' ')[0]}
          </NavLink>

          <button onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-400 font-mono border border-slate-700
                       hover:border-red-800 px-3 py-1.5 rounded-lg transition-all duration-150">
            logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
