import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500',
  'bg-purple-600', 'bg-pink-500', 'bg-indigo-600', 'bg-orange-500',
  'bg-teal-600', 'bg-cyan-600', 'bg-lime-600', 'bg-rose-600',
];

function userColor(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Home() {
  const { users, currentUser, setCurrentUser, leaderboard } = useApp();
  const navigate = useNavigate();

  function selectUser(user) {
    setCurrentUser(user);
    navigate('/groups');
  }

  const lbMap = {};
  leaderboard.forEach(r => { lbMap[r.id] = r; });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">⚽</div>
        <h1 className="text-3xl font-bold text-[#003087] mb-2">World Cup 2026 Predictions</h1>
        <p className="text-gray-500">Pick your name to start predicting — earn points for every correct result!</p>
      </div>

      {/* Scoring guide */}
      <div className="card mb-6">
        <h2 className="font-bold text-lg mb-3 text-[#003087]">📋 How to Score Points</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-blue-800 mb-1">Group Stage</div>
            <div className="text-gray-700">✅ Correct result → <b>1 pt</b></div>
            <div className="text-gray-700">🎯 Correct score → <b>2 pts</b></div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-semibold text-green-800 mb-1">Knockout Stage</div>
            <div className="text-gray-700">Round of 32 → <b>2 pts</b></div>
            <div className="text-gray-700">Round of 16 → <b>4 pts</b></div>
            <div className="text-gray-700">Quarter-finals → <b>6 pts</b></div>
            <div className="text-gray-700">Semi-finals → <b>8 pts</b></div>
            <div className="text-gray-700">Final → <b>10 pts</b></div>
          </div>
        </div>
      </div>

      {/* Player selection */}
      <div className="card">
        <h2 className="font-bold text-lg mb-4 text-[#003087]">👥 Who are you?</h2>
        <div className="grid grid-cols-2 gap-3">
          {users.map(user => {
            const isActive = currentUser?.id === user.id;
            const pts      = lbMap[user.id]?.total_points ?? 0;
            const rank     = lbMap[user.id]?.rank ?? '—';
            const hasPreds = (lbMap[user.id]?.pred_count ?? 0) > 0;
            const color    = userColor(user.name);
            return (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? 'border-[#003087] bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {user.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {pts > 0
                      ? `${pts} pts · #${rank}`
                      : hasPreds
                        ? <span className="text-green-600 font-semibold">Predictions made! ✓</span>
                        : 'No predictions yet'}
                  </div>
                </div>
                {isActive && <span className="ml-auto text-[#003087] text-lg">✓</span>}
              </button>
            );
          })}
        </div>

        {currentUser && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => navigate('/groups')} className="btn-primary flex-1">
              ⚽ Make Group Predictions
            </button>
            <button onClick={() => navigate('/knockout')} className="btn-secondary flex-1">
              🏆 Knockout Stage
            </button>
          </div>
        )}
      </div>

      {/* Tournament info */}
      <div className="mt-6 card text-sm text-gray-600">
        <div className="font-semibold text-gray-800 mb-2">📅 Tournament Timeline</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>🏟️ Group Stage: Jun 11 – Jun 27</div>
          <div>⚔️ Round of 32: Jun 28 – Jul 4</div>
          <div>🥊 Round of 16: Jul 4 – Jul 7</div>
          <div>🏅 Quarter-finals: Jul 9 – Jul 11</div>
          <div>🌟 Semi-finals: Jul 14 – Jul 15</div>
          <div>🏆 Final: Jul 19 · MetLife Stadium</div>
        </div>
      </div>
    </div>
  );
}
