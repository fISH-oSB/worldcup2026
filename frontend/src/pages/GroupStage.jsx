import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import MatchCard from '../components/MatchCard';
import GroupTable from '../components/GroupTable';
import { buildPredictedStandings } from '../utils/predictionStandings';

const GROUP_NAMES = 'ABCDEFGHIJKL'.split('');

export default function GroupStage() {
  const { groupMatches, standings, currentUser, predictions } = useApp();
  const [activeGroup, setActiveGroup] = useState('A');

  const filteredMatches = groupMatches.filter(m => m.group_name === activeGroup);
  const realStandings   = standings[activeGroup] || [];

  // Compute predicted standings for active group
  const predStandings = useMemo(() => {
    if (!currentUser) return [];
    return buildPredictedStandings(activeGroup, groupMatches, predictions);
  }, [activeGroup, groupMatches, predictions, currentUser]);

  const predCount = useMemo(() =>
    groupMatches.filter(m => predictions[m.id]?.pred_home !== null && predictions[m.id]?.pred_home !== undefined).length,
    [groupMatches, predictions]
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#7B1D2E' }}>⚽ Group Stage</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentUser
              ? `${predCount} / ${groupMatches.length} predictions saved`
              : 'Pick your name on the Home page to make predictions'}
          </p>
        </div>
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {GROUP_NAMES.map(g => {
          const gm   = groupMatches.filter(m => m.group_name === g);
          const done = gm.filter(m => predictions[m.id]?.pred_home !== null && predictions[m.id]?.pred_home !== undefined).length;
          const isActive = activeGroup === g;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${
                isActive
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #7B1D2E, #4A1060)', borderColor: 'transparent' } : {}}
            >
              Group {g}
              {currentUser && done > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {done}/{gm.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Matches — takes 3/5 columns */}
        <div className="lg:col-span-3 space-y-2.5">
          <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wider">Group {activeGroup} Matches</h2>
          {filteredMatches.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>

        {/* Standings sidebar — takes 2/5 columns */}
        <div className="lg:col-span-2 space-y-3">
          {/* Official standings */}
          <GroupTable
            rows={realStandings}
            label={`Group ${activeGroup} — Official Standings`}
            isPredicted={false}
          />

          {/* Predicted standings */}
          {currentUser ? (
            <div>
              <GroupTable
                rows={predStandings}
                label={`Group ${activeGroup} — Your Predicted Table`}
                isPredicted={true}
              />
              {predStandings.length > 0 && predStandings.every(r => r.played === 0) && (
                <p className="text-xs text-gray-400 mt-1 italic text-center">
                  Enter your score predictions above to see your predicted table
                </p>
              )}
            </div>
          ) : (
            <div className="card bg-indigo-50 border border-indigo-100 text-center py-4 text-sm text-indigo-500">
              <div className="text-2xl mb-1">🔮</div>
              <p>Sign in to see your <strong>predicted standings</strong></p>
            </div>
          )}

          <p className="text-xs text-gray-400 leading-relaxed">
            🟢 Top 2 advance automatically · 🟡 Best 8 third-place teams also advance
          </p>
        </div>
      </div>
    </div>
  );
}
