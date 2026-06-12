const express = require('express');
const router = express.Router();
const { normalizeTeamName } = require('../utils/teamNameMap');
const { scoreGroupPrediction, scoreKnockoutPrediction } = require('../utils/scoring');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'worldcup2026';

function requireAdmin(req, res, next) {
  const pw = req.headers['x-admin-password'] || req.body?.password;
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ESPN public API — no key required
// Returns all World Cup matches for a date range
async function fetchESPN(dateStr) {
  // dateStr format: YYYYMMDD
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}&limit=50`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);
  return res.json();
}

// Parse ESPN event into a normalised result object
function parseESPNEvent(event) {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  const status = comp.status?.type;
  const finished = status?.completed === true || status?.name === 'STATUS_FINAL';
  if (!finished) return null;

  const home = comp.competitors?.find(c => c.homeAway === 'home');
  const away = comp.competitors?.find(c => c.homeAway === 'away');
  if (!home || !away) return null;

  return {
    homeTeam: normalizeTeamName(home.team?.displayName || home.team?.name),
    awayTeam: normalizeTeamName(away.team?.displayName || away.team?.name),
    homeScore: parseInt(home.score ?? 0),
    awayScore: parseInt(away.score ?? 0),
    date: event.date?.slice(0, 10), // YYYY-MM-DD
  };
}

// Find our match that corresponds to an ESPN result
function findMatch(dbMatches, result) {
  return dbMatches.find(m => {
    if (m.status === 'finished') return false; // already done
    const homeOk = m.home_team === result.homeTeam;
    const awayOk = m.away_team === result.awayTeam;
    // Also allow flipped (ESPN sometimes swaps home/away)
    const homeFlip = m.home_team === result.awayTeam;
    const awayFlip = m.away_team === result.homeTeam;
    return (homeOk && awayOk) || (homeFlip && awayFlip);
  });
}

function applyResult(match, result, db) {
  // Handle flipped home/away
  const flipped = match.home_team === result.awayTeam;
  const homeScore = flipped ? result.awayScore : result.homeScore;
  const awayScore = flipped ? result.homeScore : result.awayScore;

  match.home_score = homeScore;
  match.away_score = awayScore;
  match.status = 'finished';

  // Knockout winner
  if (match.stage !== 'group') {
    if (homeScore > awayScore)      match.winner = match.home_team;
    else if (awayScore > homeScore) match.winner = match.away_team;
  }

  // Re-score all predictions for this match
  const preds = db.data.predictions.filter(p => p.match_id === match.id);
  preds.forEach(p => {
    p.points = match.stage === 'group'
      ? scoreGroupPrediction(p, match)
      : scoreKnockoutPrediction(p, match, match.stage);
  });

  return { id: match.id, home: match.home_team, away: match.away_team, homeScore, awayScore };
}

// ── Core sync function (shared by auto-sync and manual routes) ───────────────
async function syncTodayAndYesterday(db) {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fmt     = d => d.toISOString().slice(0, 10).replace(/-/g, '');
  const dates   = [fmt(yesterday), fmt(today)];
  const updated = [];
  const errors  = [];

  for (const dateStr of dates) {
    try {
      const data   = await fetchESPN(dateStr);
      const events = data.events || [];
      for (const event of events) {
        const result = parseESPNEvent(event);
        if (!result) continue;
        const match = findMatch(db.data.matches, result);
        if (!match) continue;
        updated.push(applyResult(match, result, db));
      }
    } catch (e) {
      errors.push(`Date ${dateStr}: ${e.message}`);
    }
  }

  if (updated.length > 0) await db.write();
  return { updated, errors };
}

module.exports = (db) => {
  // Manual trigger: sync results for today (or a specified date range)
  router.post('/now', requireAdmin, async (req, res) => {
    try {
      const { updated, errors } = await syncTodayAndYesterday(db);
      res.json({ success: true, updated, errors, message: `${updated.length} match(es) updated` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Sync a specific date (YYYY-MM-DD)
  router.post('/date', requireAdmin, async (req, res) => {
    const { date } = req.body; // expects "2026-06-11"
    if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });

    try {
      const dateStr = date.replace(/-/g, '');
      const data = await fetchESPN(dateStr);
      const events = data.events || [];

      const updated = [];
      for (const event of events) {
        const result = parseESPNEvent(event);
        if (!result) continue;
        const match = findMatch(db.data.matches, result);
        if (!match) continue;
        updated.push(applyResult(match, result, db));
      }

      if (updated.length > 0) await db.write();
      res.json({ success: true, updated, rawEventCount: events.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Preview what ESPN currently has (no DB changes)
  router.get('/preview', requireAdmin, async (req, res) => {
    try {
      const today = new Date();
      const fmt = d => d.toISOString().slice(0, 10).replace(/-/g, '');
      const data = await fetchESPN(fmt(today));
      const events = (data.events || []).map(e => {
        const comp = e.competitions?.[0];
        const home = comp?.competitors?.find(c => c.homeAway === 'home');
        const away = comp?.competitors?.find(c => c.homeAway === 'away');
        return {
          name: e.name,
          date: e.date,
          status: comp?.status?.type?.name,
          completed: comp?.status?.type?.completed,
          home: home?.team?.displayName,
          homeScore: home?.score,
          away: away?.team?.displayName,
          awayScore: away?.score,
        };
      });
      res.json({ date: fmt(today), events });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};

module.exports.syncTodayAndYesterday = syncTodayAndYesterday;
