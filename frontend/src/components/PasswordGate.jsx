import React, { useState } from 'react';

const SITE_PASSWORD = 'BestFriendFischer!';
const STORAGE_KEY   = 'wc2026_site_auth';

export function isAuthenticated() {
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export default function PasswordGate({ children }) {
  const [authed, setAuthed]     = useState(isAuthenticated);
  const [input, setInput]       = useState('');
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);

  function tryLogin(e) {
    e.preventDefault();
    if (input === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setAuthed(true);
    } else {
      setError('Wrong password — try again!');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setInput('');
    }
  }

  if (authed) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B1D2E] via-[#4A1060] to-[#003087] p-4">
      <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center ${shake ? 'animate-shake' : ''}`}>

        {/* FIFA 2026 header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B1D2E] to-[#4A1060] mb-3 shadow-lg">
            <span className="text-white font-black text-3xl tracking-tighter leading-none">26</span>
          </div>
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">FIFA</div>
          <h1 className="text-xl font-bold text-gray-800 mt-2">Family Predictions 2026</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the family password to join</p>
        </div>

        <form onSubmit={tryLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            autoFocus
            className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-lg focus:border-[#7B1D2E] focus:outline-none transition-colors"
          />
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-[#7B1D2E] to-[#4A1060] hover:opacity-90 transition-opacity shadow-lg"
          >
            Enter ⚽
          </button>
        </form>

        <p className="text-xs text-gray-300 mt-4">Fischer Family Only 🏆</p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          20%{ transform:translateX(-8px) }
          40%{ transform:translateX(8px) }
          60%{ transform:translateX(-6px) }
          80%{ transform:translateX(6px) }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
