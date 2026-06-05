import React from 'react';
import { useApp } from '../context/AppContext';

const MEDALS = ['🥇', '🥈', '🥉'];

const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500',
  'bg-purple-600', 'bg-pink-500', 'bg-indigo-600', 'bg-orange-500',
  'bg-teal-600', 'bg-cyan-600',
];
function userColor(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Leaderboard() {
  const { leaderboard, currentUser, loading } = useApp();

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  const maxPts = leaderboard[0]?.total_points || 1;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#003087] mb-1">📊 Leaderboard</h1>
      <p className="text-sm text-gray-500 mb-5">Updates automatically as results come in</p>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-6">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((row, i) => {
            const heights = ['h-20', 'h-28', 'h-16'];
            const podiumPos = [2, 1, 3];
            return (
              <div key={row.id} className="flex flex-col items-center">
                <div className={`${userColor(row.name)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-1`}>
                  {row.name[0]}
                </div>
                <div className="text-xs font-semibold text-gray-700 mb-1 max-w-[80px] text-center truncate">{row.name}</div>
                <div className="text-sm font-bold text-[#003087]">{row.total_points} pts</div>
                <div className={`${heights[i]} w-20 bg-gradient-to-t from-[#003087] to-blue-400 rounded-t-lg flex items-start justify-center pt-2 text-white font-bold text-lg`}>
                  {MEDALS[podiumPos[i] - 1] || podiumPos[i]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-[#003087] text-white text-xs">
              <th className="py-2 px-3 text-left w-8">#</th>
              <th className="py-2 px-3 text-left">Player</th>
              <th className="py-2 px-2 text-center">Groups</th>
              <th className="py-2 px-2 text-center">R32</th>
              <th className="py-2 px-2 text-center">R16</th>
              <th className="py-2 px-2 text-center">QF</th>
              <th className="py-2 px-2 text-center">SF</th>
              <th className="py-2 px-2 text-center">Final</th>
              <th className="py-2 px-3 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => {
              const isMe = currentUser?.id === row.id;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-gray-100 transition-colors ${isMe ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="py-2.5 px-3 text-gray-500 font-medium">
                    {i < 3 ? MEDALS[i] : row.rank}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`${userColor(row.name)} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {row.name[0]}
                      </div>
                      <span className={`font-medium text-sm ${isMe ? 'text-[#003087]' : ''}`}>
                        {row.name}{isMe ? ' (you)' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.group_pts}</td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.r32_pts}</td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.r16_pts}</td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.qf_pts}</td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.sf_pts}</td>
                  <td className="py-2.5 px-2 text-center text-sm text-gray-600">{row.final_pts}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#003087]">{row.total_points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Progress bar */}
      {leaderboard.length > 0 && (
        <div className="mt-4 space-y-2">
          {leaderboard.map(row => (
            <div key={row.id} className="flex items-center gap-2 text-xs">
              <div className="w-24 text-right text-gray-600 truncate">{row.name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#003087] to-[#00a550] rounded-full transition-all"
                  style={{ width: `${(row.total_points / maxPts) * 100}%` }}
                />
              </div>
              <div className="w-10 text-gray-700 font-semibold">{row.total_points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
