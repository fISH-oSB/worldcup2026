import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// ─── helpers ────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── component ──────────────────────────────────────────────────────────────
export default function Admin() {
  const { matches, fetchAll } = useApp();
  const [password, setPassword]     = useState('');
  const [authed, setAuthed]         = useState(false);
  const [authError, setAuthError]   = useState('');
  const [activeTab, setActiveTab]   = useState('sync');

  // Sync state
  const [syncLog, setSyncLog]       = useState([]);
  const [syncing, setSyncing]       = useState(false);
  const [autoInterval, setAutoInterval] = useState(0); // minutes, 0 = off
  const [syncDate, setSyncDate]     = useState(todayStr());
  const autoRef = useRef(null);

  // Manual result entry
  const [manualStage, setManualStage] = useState('group');
  const [form, setForm]             = useState({ match_id: '', home_score: '', away_score: '', winner: '' });
  const [msg, setMsg]               = useState('');
  const [loading, setLoading]       = useState(false);

  // ── auto-sync timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (authed && autoInterval > 0) {
      autoRef.current = setInterval(() => runSync('now'), autoInterval * 60 * 1000);
      log(`⏱ Auto-sync every ${autoInterval} minute(s)`);
    }
    return () => clearInterval(autoRef.current);
  }, [authed, autoInterval]); // eslint-disable-line

  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    setSyncLog(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
  }

  // ── auth ──────────────────────────────────────────────────────────────────
  function tryAuth() {
    if (password.trim()) { setAuthed(true); setAuthError(''); }
    else setAuthError('Enter the admin password');
  }

  // ── API helpers ───────────────────────────────────────────────────────────
  async function adminPost(endpoint, body = {}) {
    const res = await fetch(`/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function syncPost(endpoint, body = {}) {
    const res = await fetch(`/api/sync/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // ── sync actions ──────────────────────────────────────────────────────────
  async function runSync(mode) {
    if (syncing) return;
    setSyncing(true);
    log(`🔄 Syncing (${mode})…`);
    try {
      const data = mode === 'now'
        ? await syncPost('now')
        : await syncPost('date', { date: syncDate });

      if (data.error) {
        log(`❌ ${data.error}`);
      } else {
        log(`✅ ${data.message || data.updated?.length + ' updated'}`);
        data.updated?.forEach(u => log(`   ⚽ ${u.home} ${u.homeScore}–${u.awayScore} ${u.away}`));
        if (data.errors?.length) data.errors.forEach(e => log(`   ⚠️ ${e}`));
        if (data.updated?.length > 0) fetchAll();
      }
    } catch (e) {
      log(`❌ Network error: ${e.message}`);
    }
    setSyncing(false);
  }

  async function runBracket() {
    setLoading(true); setMsg('');
    const data = await adminPost('populate-bracket');
    setLoading(false);
    setMsg(data.error ? `❌ ${data.error}` : '✅ Bracket populated from group results!');
    fetchAll();
  }

  async function runAdvance() {
    setLoading(true); setMsg('');
    const data = await adminPost('advance-winners');
    setLoading(false);
    setMsg(data.error ? `❌ ${data.error}` : '✅ Winners advanced into next round.');
    fetchAll();
  }

  async function submitResult(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    const data = await adminPost('result', {
      match_id: parseInt(form.match_id),
      home_score: parseInt(form.home_score),
      away_score: parseInt(form.away_score),
    });
    setLoading(false);
    setMsg(data.error ? `❌ ${data.error}` : `✅ Saved. ${data.pointsUpdated ?? 0} predictions re-scored.`);
    fetchAll();
  }

  async function submitWinner(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    const data = await adminPost('winner', { match_id: parseInt(form.match_id), winner: form.winner });
    setLoading(false);
    setMsg(data.error ? `❌ ${data.error}` : '✅ Winner set and predictions re-scored.');
    fetchAll();
  }

  const stageMatches = matches.filter(m => m.stage === manualStage)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  // ── auth gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-[#003087] mb-4">Admin Access</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryAuth()}
            className="w-full border-2 border-gray-300 rounded-lg p-2 mb-3 focus:border-[#003087] focus:outline-none"
          />
          {authError && <p className="text-red-500 text-sm mb-2">{authError}</p>}
          <button onClick={tryAuth} className="btn-primary w-full">Enter</button>
          <p className="text-xs text-gray-400 mt-3">Default: <code>worldcup2026</code> · Change via <code>ADMIN_PASSWORD</code> env var</p>
        </div>
      </div>
    );
  }

  // ── main admin UI ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#003087]">🔐 Admin Panel</h1>
        <button onClick={() => setAuthed(false)} className="btn-secondary text-sm">Sign Out</button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 mb-5">
        {[['sync','🔄 Auto-Sync'], ['bracket','🏆 Bracket'], ['manual','✏️ Manual Entry']].map(([k, l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === k ? 'bg-[#003087] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >{l}</button>
        ))}
      </div>

      {/* ── SYNC TAB ── */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-1">🌐 Auto-Sync from ESPN</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pulls live/finished match scores from ESPN's public API (no API key needed).
              Automatically maps team names, updates scores, and re-scores all predictions.
            </p>

            {/* Quick sync */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => runSync('now')}
                disabled={syncing}
                className="btn-primary flex items-center gap-2"
              >
                {syncing ? <span className="animate-spin">⏳</span> : '🔄'}
                Sync Today's Results
              </button>
            </div>

            {/* Date-specific sync */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Sync specific date:</label>
              <input
                type="date"
                value={syncDate}
                onChange={e => setSyncDate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg p-1.5 text-sm focus:border-[#003087] focus:outline-none"
              />
              <button onClick={() => runSync('date')} disabled={syncing} className="btn-secondary text-sm">
                Sync This Date
              </button>
            </div>

            {/* Auto-poll */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-blue-800">⏱ Auto-refresh every:</span>
                {[0, 1, 2, 5, 10, 30].map(m => (
                  <button
                    key={m}
                    onClick={() => setAutoInterval(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      autoInterval === m
                        ? 'bg-[#003087] text-white'
                        : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {m === 0 ? 'Off' : `${m}m`}
                  </button>
                ))}
              </div>
              {autoInterval > 0 && (
                <p className="text-xs text-blue-600 mt-1.5">
                  🟢 Auto-syncing every {autoInterval} minute(s). Keep this tab open.
                </p>
              )}
            </div>
          </div>

          {/* Sync log */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700">Sync Log</h3>
              <button onClick={() => setSyncLog([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
            {syncLog.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No syncs yet — hit "Sync Today's Results" to start.</p>
            ) : (
              <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-xs space-y-0.5 max-h-64 overflow-y-auto">
                {syncLog.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card bg-gray-50 text-sm text-gray-600">
            <div className="font-semibold text-gray-800 mb-2">ℹ️ How it works</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Fetches completed match scores from <strong>ESPN's public API</strong> (free, no setup)</li>
              <li>Matches games by team names, updates the database automatically</li>
              <li>Re-calculates everyone's prediction scores instantly</li>
              <li>Use <strong>Auto-refresh</strong> on match days to keep scores current</li>
              <li>If a team name doesn't match, use the Manual Entry tab to fix it</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── BRACKET TAB ── */}
      {activeTab === 'bracket' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3">🏆 Bracket Management</h2>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="font-semibold text-green-800 mb-1">Step 1 — After all 48 group games</div>
                <p className="text-xs text-green-700 mb-2">Calculates group standings, finds best 8 third-place teams, and populates the Round of 32 bracket.</p>
                <button onClick={runBracket} disabled={loading} className="btn-green text-sm">
                  🏁 Populate Round of 32 Bracket
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="font-semibold text-blue-800 mb-1">Step 2 — After each knockout round</div>
                <p className="text-xs text-blue-700 mb-2">Auto-fills winners into R16, QF, SF, and Final match slots.</p>
                <button onClick={runAdvance} disabled={loading} className="btn-primary text-sm">
                  ➡️ Auto-Advance Winners to Next Round
                </button>
              </div>
            </div>
            {msg && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {msg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MANUAL ENTRY TAB ── */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          {/* Enter result */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3">✏️ Enter Match Result</h2>
            <div className="flex flex-wrap gap-1 mb-3">
              {['group','r32','r16','qf','sf','final','third'].map(s => (
                <button key={s} onClick={() => setManualStage(s)}
                  className={`px-2 py-1 text-xs rounded-md font-medium ${manualStage === s ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >{s}</button>
              ))}
            </div>
            <form onSubmit={submitResult} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Select Match</label>
                <select
                  value={form.match_id}
                  onChange={e => setForm(f => ({ ...f, match_id: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-[#003087] focus:outline-none"
                >
                  <option value="">— choose a match —</option>
                  {stageMatches.map(m => {
                    const h = m.home_team || m.home_slot || 'TBD';
                    const a = m.away_team || m.away_slot || 'TBD';
                    const done = m.status === 'finished' ? ` ✓ (${m.home_score}-${m.away_score})` : '';
                    return <option key={m.id} value={m.id}>#{m.id} {h} vs {a}{done}</option>;
                  })}
                </select>
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Home</label>
                  <input type="number" min="0" max="30" value={form.home_score}
                    onChange={e => setForm(f => ({ ...f, home_score: e.target.value }))}
                    className="score-input w-16" required />
                </div>
                <span className="text-xl font-bold text-gray-400 mb-1">–</span>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Away</label>
                  <input type="number" min="0" max="30" value={form.away_score}
                    onChange={e => setForm(f => ({ ...f, away_score: e.target.value }))}
                    className="score-input w-16" required />
                </div>
                <button type="submit" disabled={loading || !form.match_id} className="btn-primary ml-2">
                  {loading ? '…' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>

          {/* Set knockout winner */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3">🏆 Set Knockout Winner (after penalties)</h2>
            <form onSubmit={submitWinner} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Match ID</label>
                <input type="number" value={form.match_id}
                  onChange={e => setForm(f => ({ ...f, match_id: e.target.value }))}
                  className="border-2 border-gray-300 rounded-lg p-2 w-24 focus:border-[#003087] focus:outline-none"
                  placeholder="e.g. 73" />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-gray-600 block mb-1">Winner (exact team name)</label>
                <input type="text" value={form.winner}
                  onChange={e => setForm(f => ({ ...f, winner: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-[#003087] focus:outline-none"
                  placeholder="e.g. Brazil" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">Set Winner</button>
            </form>
          </div>

          {msg && (
            <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
