import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wc2026_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});  // matchId → prediction
  const [leaderboard, setLeaderboard] = useState([]);
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  // Persist user to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('wc2026_user', JSON.stringify(currentUser));
    else localStorage.removeItem('wc2026_user');
  }, [currentUser]);

  const fetchAll = useCallback(async () => {
    try {
      const [usersRes, matchesRes, lbRes, standingsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/matches'),
        fetch('/api/leaderboard'),
        fetch('/api/matches/standings/all'),
      ]);
      setUsers(await usersRes.json());
      setMatches(await matchesRes.json());
      setLeaderboard(await lbRes.json());
      setStandings(await standingsRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPredictions = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/predictions/user/${userId}`);
      const data = await res.json();
      const map = {};
      data.forEach(p => { map[p.match_id] = p; });
      setPredictions(map);
    } catch (e) {
      console.error('Failed to fetch predictions', e);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (currentUser) fetchPredictions(currentUser.id);
    else setPredictions({});
  }, [currentUser, fetchPredictions]);

  const savePrediction = async (matchId, predHome, predAway, predWinner) => {
    if (!currentUser) return;
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        match_id: matchId,
        pred_home: predHome,
        pred_away: predAway,
        pred_winner: predWinner,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setPredictions(prev => ({
        ...prev,
        [matchId]: { ...prev[matchId], match_id: matchId, pred_home: predHome, pred_away: predAway, pred_winner: predWinner },
      }));
      fetchAll(); // refresh leaderboard
    }
    return data;
  };

  const saveBulkPredictions = async (preds) => {
    if (!currentUser) return;
    const res = await fetch('/api/predictions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, predictions: preds }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPredictions(currentUser.id);
      fetchAll();
    }
    return data;
  };

  const groupMatches = matches.filter(m => m.stage === 'group');
  const knockoutMatches = matches.filter(m => m.stage !== 'group');

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      users, matches, groupMatches, knockoutMatches,
      predictions, leaderboard, standings,
      loading, fetchAll, fetchPredictions,
      savePrediction, saveBulkPredictions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
