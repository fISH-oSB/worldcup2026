import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = [
  'bg-red-700', 'bg-blue-700', 'bg-green-700', 'bg-yellow-600',
  'bg-purple-700', 'bg-pink-600', 'bg-indigo-700', 'bg-orange-600',
  'bg-teal-700', 'bg-cyan-700',
];
function userColor(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Navbar() {
  const { currentUser, setCurrentUser } = useApp();
  const loc = useLocation();

  const links = [
    { to: '/',             label: 'Home',       icon: '🏠' },
    { to: '/groups',       label: 'Groups',     icon: '⚽' },
    { to: '/knockout',     label: 'Knockout',   icon: '🏆' },
    { to: '/leaderboard',  label: 'Standings',  icon: '📊' },
  ];

  return (
    <nav className="shadow-xl" style={{ background: 'linear-gradient(135deg, #7B1D2E 0%, #4A1060 50%, #0A2E6E 100%)' }}>
      {/* Rainbow accent bar */}
      <div className="h-1 fifa-gradient" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo — FIFA 2026 style */}
          <Link to="/" className="flex items-center gap-2.5 select-none">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg shadow-lg overflow-hidden"
                 style={{ background: 'white' }}>
              <span className="font-black text-sm leading-none" style={{ color: '#7B1D2E', letterSpacing: '-1px' }}>26</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-black text-sm tracking-widest leading-none">FIFA</div>
              <div className="text-white/70 font-medium text-xs tracking-wider leading-none">WORLD CUP 2026</div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  loc.pathname === l.to
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{l.icon}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            ))}
          </div>

          {/* User */}
          <div className="flex items-center gap-2 min-w-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className={`${userColor(currentUser.name)} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}>
                  {currentUser.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-white text-sm font-semibold truncate max-w-[100px]">{currentUser.name}</span>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="text-white/50 hover:text-white text-xs ml-0.5"
                  title="Switch user"
                >✕</button>
              </div>
            ) : (
              <Link to="/" className="text-sm text-white/70 hover:text-white font-medium">Pick name →</Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom rainbow bar */}
      <div className="h-0.5 fifa-gradient opacity-60" />
    </nav>
  );
}
