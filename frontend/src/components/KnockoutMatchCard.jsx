import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TeamName } from '../utils/flags.jsx';

function fmtDate(dtStr) {
  if (!dtStr) return '';
  const d = new Date(dtStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export default function KnockoutMatchCard({ match, pointsValue, overrideHome, overrideAway }) {
  const { currentUser, predictions, savePrediction } = useApp();
  const pred = predictions[match.id];

  const [winner, setWinner] = useState('');
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWinner(pred?.pred_winner ?? '');
  }, [pred]);

  const finished   = match.status === 'finished';
  // Use override teams (from predicted bracket) or real teams, or slot label
  const homeTeam   = overrideHome ?? match.home_team ?? match.home_slot ?? 'TBD';
  const awayTeam   = overrideAway ?? match.away_team ?? match.away_slot ?? 'TBD';
  const teamsKnown = (overrideHome && overrideAway) || (match.home_team && match.away_team);

  let ptsBadge = null;
  if (finished && pred?.pred_winner) {
    const pts = pred?.points ?? 0;
    ptsBadge = pts > 0
      ? <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">+{pts} pts ✓</span>
      : <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">0 pts</span>;
  }

  async function handlePick(team) {
    if (!currentUser || finished || !teamsKnown) return;
    const realTeam = match.home_team === team || match.away_team === team
      ? team
      : (overrideHome === team ? team : overrideAway === team ? team : team);
    setWinner(realTeam);
    setSaving(true);
    await savePrediction(match.id, null, null, realTeam);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isHomeWinner = winner === homeTeam || (finished && match.winner === match.home_team);
  const isAwayWinner = winner === awayTeam || (finished && match.winner === match.away_team);

  return (
    <div className={`card p-3 ${finished ? 'bg-gray-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{fmtDate(match.datetime)}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: 'linear-gradient(135deg, #7B1D2E, #4A1060)' }}>
            {pointsValue} pts
          </span>
          <span className="text-xs text-gray-400 italic">{match.venue}</span>
        </div>
      </div>

      {finished ? (
        /* Finished result */
        <div className="flex items-center gap-2">
          <div className={`flex-1 text-right text-sm font-bold ${match.winner === match.home_team ? 'text-green-600' : 'text-gray-500'}`}>
            <TeamName name={homeTeam} size={16} />
          </div>
          <div className="text-lg font-black text-gray-700 flex-shrink-0 px-1">
            {match.home_score} – {match.away_score}
          </div>
          <div className={`flex-1 text-left text-sm font-bold ${match.winner === match.away_team ? 'text-green-600' : 'text-gray-500'}`}>
            <TeamName name={awayTeam} size={16} />
          </div>
        </div>

      ) : teamsKnown && currentUser ? (
        /* Pick winner buttons */
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePick(homeTeam)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-1 ${
              isHomeWinner
                ? 'text-white border-transparent shadow-md'
                : 'border-gray-200 text-gray-700 hover:border-red-300 bg-white'
            }`}
            style={isHomeWinner ? { background: 'linear-gradient(135deg, #7B1D2E, #4A1060)' } : {}}
          >
            <TeamName name={homeTeam} size={14} />
          </button>
          <span className="text-gray-400 text-xs font-bold flex-shrink-0">VS</span>
          <button
            onClick={() => handlePick(awayTeam)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-1 ${
              isAwayWinner
                ? 'text-white border-transparent shadow-md'
                : 'border-gray-200 text-gray-700 hover:border-red-300 bg-white'
            }`}
            style={isAwayWinner ? { background: 'linear-gradient(135deg, #7B1D2E, #4A1060)' } : {}}
          >
            <TeamName name={awayTeam} size={14} />
          </button>
        </div>

      ) : (
        /* TBD or not logged in */
        <div className="flex items-center justify-center gap-2 py-2 text-gray-400 text-sm">
          {teamsKnown ? (
            <>
              <TeamName name={homeTeam} size={14} />
              <span className="font-bold">vs</span>
              <TeamName name={awayTeam} size={14} />
            </>
          ) : (
            <span className="italic text-xs">{homeTeam} vs {awayTeam}</span>
          )}
        </div>
      )}

      {/* Status footer */}
      <div className="mt-1.5 flex items-center justify-between text-xs min-h-[16px]">
        {winner && !finished ? (
          <span className="text-gray-500">
            {saving ? 'Saving…' : saved ? '✓ Saved' : `Pick: `}
            {!saving && !saved && <TeamName name={winner} size={12} />}
          </span>
        ) : !teamsKnown ? (
          <span className="text-gray-300 italic">Teams TBD after group stage</span>
        ) : !currentUser ? (
          <span className="text-gray-400 italic">Sign in to predict</span>
        ) : (
          <span className="text-gray-400 italic">Tap a team to pick the winner</span>
        )}
        {ptsBadge}
      </div>
    </div>
  );
}
