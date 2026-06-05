import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TeamName } from '../utils/flags.jsx';

function fmtDate(dtStr) {
  if (!dtStr) return '';
  const d = new Date(dtStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

// Floating "+N" goal animation
function GoalPop({ value, side }) {
  return (
    <span
      className="goal-pop"
      style={{ [side === 'left' ? 'right' : 'left']: '4px', top: '-4px' }}
    >
      +{value}⚽
    </span>
  );
}

export default function MatchCard({ match }) {
  const { currentUser, predictions, savePrediction } = useApp();
  const pred = predictions[match.id];

  const [home, setHome]     = useState('');
  const [away, setAway]     = useState('');
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  // Goal pop animations
  const [homePop, setHomePop] = useState(null);
  const [awayPop, setAwayPop] = useState(null);
  const homeRef = useRef(null);
  const awayRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    setHome(pred?.pred_home ?? '');
    setAway(pred?.pred_away ?? '');
  }, [pred]);

  // Auto-save 1.2s after last change
  const scheduleAutosave = useCallback((newHome, newAway) => {
    if (!currentUser) return;
    if (newHome === '' || newAway === '') return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await savePrediction(match.id, parseInt(newHome), parseInt(newAway), null);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  }, [currentUser, match.id, savePrediction]);

  function handleHome(e) {
    const val = e.target.value;
    const prev = parseInt(home) || 0;
    const next = parseInt(val) || 0;
    if (!isNaN(next) && next > prev) {
      setHomePop(next);
      setTimeout(() => setHomePop(null), 900);
    }
    setHome(val);
    scheduleAutosave(val, away);
  }

  function handleAway(e) {
    const val = e.target.value;
    const prev = parseInt(away) || 0;
    const next = parseInt(val) || 0;
    if (!isNaN(next) && next > prev) {
      setAwayPop(next);
      setTimeout(() => setAwayPop(null), 900);
    }
    setAway(val);
    scheduleAutosave(home, val);
  }

  const finished = match.status === 'finished';
  const homeTeam = match.home_team || match.home_slot || 'TBD';
  const awayTeam = match.away_team || match.away_slot || 'TBD';
  const hasPred  = pred?.pred_home !== null && pred?.pred_home !== undefined;

  let ptsBadge = null;
  if (finished && hasPred) {
    const pts = pred?.points ?? 0;
    ptsBadge = pts === 2
      ? <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">🎯 +2 pts</span>
      : pts === 1
      ? <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">✓ +1 pt</span>
      : <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">0 pts</span>;
  }

  return (
    <div className={`card p-3 ${finished ? 'bg-gray-50/80' : ''}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{fmtDate(match.datetime)}</span>
        <span className="text-xs text-gray-400 italic truncate ml-2">{match.venue}</span>
      </div>

      {/* Teams + score row */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex-1 text-right">
          <span className={`text-sm font-semibold ${match.winner === match.home_team ? 'text-green-600' : 'text-gray-800'}`}>
            <TeamName name={homeTeam} size={16} />
          </span>
        </div>

        {/* Score / inputs */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {finished ? (
            <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
              <span className="w-8 text-center bg-gray-100 rounded px-1">{match.home_score}</span>
              <span className="text-gray-400 text-sm">–</span>
              <span className="w-8 text-center bg-gray-100 rounded px-1">{match.away_score}</span>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-1">
              {/* Home score input */}
              <div className="relative" ref={homeRef}>
                {homePop && <GoalPop value={homePop} side="left" />}
                <input
                  type="number" min="0" max="20"
                  value={home}
                  onChange={handleHome}
                  className="score-input"
                  placeholder="?"
                />
              </div>
              <span className="text-gray-400 font-bold text-sm">–</span>
              {/* Away score input */}
              <div className="relative" ref={awayRef}>
                {awayPop && <GoalPop value={awayPop} side="right" />}
                <input
                  type="number" min="0" max="20"
                  value={away}
                  onChange={handleAway}
                  className="score-input"
                  placeholder="?"
                />
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm px-2 font-bold">vs</span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <span className={`text-sm font-semibold ${match.winner === match.away_team ? 'text-green-600' : 'text-gray-800'}`}>
            <TeamName name={awayTeam} size={16} />
          </span>
        </div>
      </div>

      {/* Status row */}
      {currentUser && !finished && (
        <div className="mt-1.5 flex items-center justify-between h-5">
          {hasPred && (
            <span className="text-xs text-gray-400">
              Saved: {pred.pred_home}–{pred.pred_away}
            </span>
          )}
          <span className={`text-xs ml-auto ${saving ? 'text-yellow-500' : saved ? 'text-green-500 font-semibold' : 'text-transparent'}`}>
            {saving ? 'Saving…' : '✓ Saved'}
          </span>
        </div>
      )}

      {finished && (
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
          {hasPred
            ? <span>Your pick: {pred.pred_home}–{pred.pred_away}</span>
            : <span className="italic text-gray-300">No prediction made</span>
          }
          {ptsBadge}
        </div>
      )}
    </div>
  );
}
