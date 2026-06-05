import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import BracketView from '../components/BracketView';
import KnockoutMatchCard from '../components/KnockoutMatchCard';
import {
  buildAllPredictedStandings,
  buildPredictedBracket,
  buildFlowingBracket,
} from '../utils/predictionStandings';

const STAGES = [
  { key: 'r32',   label: 'R32',  pts: 2 },
  { key: 'r16',   label: 'R16',  pts: 4 },
  { key: 'qf',    label: 'QF',   pts: 6 },
  { key: 'sf',    label: 'SF',   pts: 8 },
  { key: 'final', label: 'Final',pts: 10 },
  { key: 'third', label: '3rd',  pts: 8 },
];

export default function Knockout() {
  const { knockoutMatches, groupMatches, currentUser, predictions, savePrediction, fetchAll } = useApp();

  // "My Predictions" is the PRIMARY tab (default)
  const [viewMode,    setViewMode]    = useState('predicted'); // 'predicted' | 'official'
  const [layoutMode,  setLayoutMode]  = useState('bracket');   // 'bracket' | 'list'
  const [activeStage, setActiveStage] = useState('r32');

  // ── Build predicted team maps ───────────────────────────────────────────────
  const { predR32TeamMap, predStandings } = useMemo(() => {
    if (!currentUser) return { predR32TeamMap: {}, predStandings: {} };
    const ps = buildAllPredictedStandings(groupMatches, predictions);
    const pb = buildPredictedBracket(knockoutMatches, ps);
    return { predR32TeamMap: pb.teamMap, predStandings: ps };
  }, [currentUser, groupMatches, knockoutMatches, predictions]);

  // Flowing bracket: teams update as user picks winners round by round
  const flowingTeams = useMemo(() => {
    if (!currentUser) return {};
    return buildFlowingBracket(knockoutMatches, predictions, predR32TeamMap);
  }, [knockoutMatches, predictions, predR32TeamMap, currentUser]);

  // Official teams map (from real DB data)
  const officialTeams = useMemo(() => {
    const map = {};
    knockoutMatches.forEach(m => { map[m.id] = { home: m.home_team, away: m.away_team }; });
    return map;
  }, [knockoutMatches]);

  // Which teams to show (depends on view mode)
  const teamsFor = viewMode === 'predicted' ? flowingTeams : officialTeams;

  // ── Pick handler ─────────────────────────────────────────────────────────────
  const handlePick = useCallback(async (matchId, team) => {
    if (!currentUser) return;
    const m = knockoutMatches.find(m => m.id === matchId);
    if (!m || m.status === 'finished') return;
    await savePrediction(matchId, null, null, team);
    fetchAll();
  }, [currentUser, knockoutMatches, savePrediction, fetchAll]);

  const predCount = knockoutMatches.filter(m => predictions[m.id]?.pred_winner).length;

  // ── Current stage matches for list view ────────────────────────────────────
  const stageMatches = knockoutMatches
    .filter(m => m.stage === activeStage)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#7B1D2E' }}>🏆 Knockout Stage</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentUser
              ? `${predCount} knockout picks saved · Picks flow automatically round to round`
              : 'Sign in from Home to make predictions'}
          </p>
        </div>

        {/* Layout toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 self-start">
          <button onClick={() => setLayoutMode('bracket')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${layoutMode === 'bracket' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >🏟 Bracket</button>
          <button onClick={() => setLayoutMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${layoutMode === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >☰ List</button>
        </div>
      </div>

      {/* PRIMARY tab bar — My Predictions first */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button onClick={() => setViewMode('predicted')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'predicted' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔮 My Predictions
            {viewMode === 'predicted' && <span className="text-xs text-purple-600">(active)</span>}
          </button>
          <button onClick={() => setViewMode('official')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'official' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Official Results
          </button>
        </div>
        {viewMode === 'predicted' && (
          <span className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
            Based on your group picks · Winners flow to next round automatically
          </span>
        )}
        {viewMode === 'official' && (
          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
            Real bracket · Teams appear once admin enters results
          </span>
        )}
      </div>

      {/* ── BRACKET VIEW ────────────────────────────────────────────────────── */}
      {layoutMode === 'bracket' && (
        <>
          {currentUser ? (
            <div className="card p-3 overflow-hidden">
              <div className="text-xs text-gray-400 mb-2">
                {viewMode === 'predicted'
                  ? '🔮 Click any team to pick them as the winner. Your picks automatically flow into the next round.'
                  : '📋 Official bracket — teams fill in after group stage results are entered.'}
              </div>
              <BracketView
                knockoutMatches={knockoutMatches}
                teamsFor={teamsFor}
                predictions={predictions}
                onPick={viewMode === 'predicted' ? handlePick : null}
              />
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🔒</div>
              <p>Sign in from the Home page to view and predict the bracket.</p>
            </div>
          )}
        </>
      )}

      {/* ── LIST VIEW ───────────────────────────────────────────────────────── */}
      {layoutMode === 'list' && (
        <>
          {/* Stage tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {STAGES.map(s => {
              const sm   = knockoutMatches.filter(m => m.stage === s.key);
              const mine = sm.filter(m => predictions[m.id]?.pred_winner).length;
              const isA  = activeStage === s.key;
              return (
                <button key={s.key} onClick={() => setActiveStage(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${
                    isA ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                  style={isA ? { background: 'linear-gradient(135deg,#7B1D2E,#4A1060)' } : {}}
                >
                  {s.label} <span className={`text-xs ${isA ? 'text-white/70' : 'text-gray-400'}`}>{s.pts}p</span>
                  {currentUser && mine > 0 && (
                    <span className={`ml-1 text-xs px-1 py-0.5 rounded-full ${isA ? 'bg-white/25' : 'bg-purple-100 text-purple-600'}`}>
                      {mine}/{sm.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {stageMatches.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">No matches loaded yet for this stage.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stageMatches.map(m => {
                const t = teamsFor[m.id] ?? {};
                return (
                  <KnockoutMatchCard
                    key={m.id}
                    match={m}
                    pointsValue={STAGES.find(s => s.key === m.stage)?.pts ?? 0}
                    overrideHome={t.home ?? undefined}
                    overrideAway={t.away ?? undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Scoring rule note */}
      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        <strong>💡 Scoring rule:</strong> You earn points if your predicted team wins that round — even if they end up on a different side of the bracket than you predicted. Pick the right team advancing, not the exact matchup!
      </div>
    </div>
  );
}
