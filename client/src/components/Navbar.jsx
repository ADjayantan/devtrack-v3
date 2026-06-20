import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/dashboard',  label: 'Dashboard',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { to: '/logs',       label: 'Logs',       icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { to: '/activities', label: 'Activities', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
  { to: '/roadmap',    label: 'Roadmap',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
  { to: '/analytics',  label: 'Stats',      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isLogsActive = location.pathname === '/logs' || location.pathname === '/activities';

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'UI';

  return (
    <>
      {/* Top Header Bar */}
      <nav className="sticky top-0 z-50 bg-[#060a12]/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="font-sans text-white text-base font-extrabold tracking-tight">DevTrack</span>
          </NavLink>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}>
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-800 bg-navy-900/30
                         hover:border-slate-600 text-slate-400 hover:text-white transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? '☀' : '◐'}
            </button>

            {/* Profile Avatar / Initials */}
            <NavLink to="/profile"
              className={({ isActive }) =>
                `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all select-none
                 ${isActive 
                   ? 'bg-cyan-400 text-navy-950 ring-2 ring-cyan-400/50' 
                   : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                 }`}>
              {initials}
            </NavLink>

            <button onClick={handleLogout}
              className="text-[10px] text-slate-400 hover:text-red-400 font-mono border border-slate-800 bg-navy-900/30
                         hover:border-red-900/60 px-2.5 py-1.5 rounded-xl transition-all duration-150 uppercase tracking-wider">
              logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060a12]/90 backdrop-blur-lg border-t border-slate-900/80 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-all ${
              isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Home</span>
          </NavLink>

          <NavLink to="/logs" className={() =>
            `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-all ${
              isLogsActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Logs</span>
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-all ${
              isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>Stats</span>
          </NavLink>

          {location.pathname === '/roadmap' ? (
            <NavLink to="/roadmap" className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-all ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              <span>Roadmap</span>
            </NavLink>
          ) : (
            <NavLink to="/profile" className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-mono tracking-wider transition-all ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>Profile</span>
            </NavLink>
          )}
        </div>
      </nav>
      {/* Spacer to avoid content being covered by fixed bottom navigation on mobile */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default Navbar;
