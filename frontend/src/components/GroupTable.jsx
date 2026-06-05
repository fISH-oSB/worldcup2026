import React from 'react';
import { TeamName } from '../utils/flags.jsx';

export default function GroupTable({ rows, label, isPredicted = false }) {
  if (!rows || rows.length === 0) return null;

  const headerBg = isPredicted
    ? 'bg-gradient-to-r from-purple-800 to-indigo-800'
    : 'bg-gradient-to-r from-[#7B1D2E] to-[#4A1060]';

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {label && (
        <div className={`${headerBg} text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5`}>
          {isPredicted ? '🔮' : '📋'} {label}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className={`${isPredicted ? 'bg-indigo-50' : 'bg-gray-50'} text-xs text-gray-500 border-b border-gray-200`}>
            <th className="text-left py-1.5 px-2 w-5 font-medium">#</th>
            <th className="text-left py-1.5 px-2 font-medium">Team</th>
            <th className="py-1.5 px-1 text-center w-7 font-medium">P</th>
            <th className="py-1.5 px-1 text-center w-7 font-medium">W</th>
            <th className="py-1.5 px-1 text-center w-7 font-medium">D</th>
            <th className="py-1.5 px-1 text-center w-7 font-medium">L</th>
            <th className="py-1.5 px-1 text-center w-10 font-medium">GD</th>
            <th className="py-1.5 px-1 text-center w-8 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.team}
              className={`border-t border-gray-100 ${
                i < 2 ? (isPredicted ? 'bg-indigo-50/60' : 'bg-green-50/70')
                      : i === 2 ? (isPredicted ? 'bg-purple-50/40' : 'bg-yellow-50/60')
                      : 'bg-white'
              }`}
            >
              <td className="py-1.5 px-2 text-gray-400 text-xs">{i + 1}</td>
              <td className="py-1.5 px-2">
                <div className="flex items-center gap-1">
                  {i < 2 && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPredicted ? 'bg-indigo-500' : 'bg-green-500'}`} />
                  )}
                  {i === 2 && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPredicted ? 'bg-purple-400' : 'bg-yellow-500'}`} />
                  )}
                  {i >= 3 && <span className="w-1.5 h-1.5 flex-shrink-0" />}
                  <TeamName name={r.team} size={14} className="text-xs font-medium" />
                </div>
              </td>
              <td className="py-1.5 px-1 text-center text-gray-500 text-xs">{r.played}</td>
              <td className="py-1.5 px-1 text-center text-gray-500 text-xs">{r.won}</td>
              <td className="py-1.5 px-1 text-center text-gray-500 text-xs">{r.drawn}</td>
              <td className="py-1.5 px-1 text-center text-gray-500 text-xs">{r.lost}</td>
              <td className="py-1.5 px-1 text-center text-gray-500 text-xs">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
              <td className={`py-1.5 px-1 text-center font-black text-xs ${isPredicted ? 'text-indigo-700' : 'text-[#7B1D2E]'}`}>
                {r.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`${isPredicted ? 'bg-indigo-50/50' : 'bg-gray-50'} px-2 py-1 text-xs text-gray-400 flex gap-3`}>
        <span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isPredicted ? 'bg-indigo-500' : 'bg-green-500'}`} />
          Advance
        </span>
        <span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isPredicted ? 'bg-purple-400' : 'bg-yellow-500'}`} />
          Potential 3rd
        </span>
      </div>
    </div>
  );
}
