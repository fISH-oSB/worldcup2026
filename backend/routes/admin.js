const express = require('express');
const router = express.Router();
const { scoreGroupPrediction, scoreKnockoutPrediction } = require('../utils/scoring');
const { calcGroupStandings, getBestThirdPlace } = require('../utils/standings');
const { GROUPS } = require('../data/matches');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'worldcup2026';
function requireAdmin(req, res, next) {
  const pw = req.headers['x-admin-password'] || req.body?.password;
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Re-score ALL predictions for every match in a stage (uses team-name rule)
function rescoreStage(db, stage) {
  const stageMatches = db.data.matches.filter(m => m.stage === stage);
  const stagePreds   = db.data.predictions.filter(p => {
    const m = db.data.matches.find(m => m.id === p.match_id);
    return m?.stage === stage;
  });
  stagePreds.forEach(p => {
    p.points = scoreKnockoutPrediction(p, stageMatches, stage);
  });
}

module.exports = (db) => {
  // Enter actual match result
  router.post('/result', requireAdmin, async (req, res) => {
    const { match_id, home_score, away_score } = req.body;
    const match = db.data.matches.find(m => m.id === match_id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    let winner = null;
    if (match.stage !== 'group') {
      if (home_score > away_score)      winner = match.home_team;
      else if (away_score > home_score) winner = match.away_team;
    }

    match.home_score = home_score;
    match.away_score = away_score;
    match.winner     = winner;
    match.status     = 'finished';

    if (match.stage === 'group') {
      // Score group predictions for just this match
      db.data.predictions.filter(p => p.match_id === match_id).forEach(p => {
        p.points = scoreGroupPrediction(p, match);
      });
    } else {
      // Re-score entire stage using team-name rule
      rescoreStage(db, match.stage);
    }

    await db.write();
    res.json({ success: true });
  });

  // Set knockout winner (after penalties)
  router.post('/winner', requireAdmin, async (req, res) => {
    const { match_id, winner } = req.body;
    const match = db.data.matches.find(m => m.id === match_id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    match.winner = winner;
    rescoreStage(db, match.stage);
    await db.write();
    res.json({ success: true });
  });

  // Populate R32 bracket from group results
  router.post('/populate-bracket', requireAdmin, async (req, res) => {
    const gm = db.data.matches.filter(m => m.stage === 'group');
    const unfinished = gm.filter(m => m.status !== 'finished');
    if (unfinished.length > 0) {
      return res.status(400).json({ error: `${unfinished.length} group matches not yet finished` });
    }

    const allStandings = {};
    Object.entries(GROUPS).forEach(([grp, teams]) => {
      const rows = gm.filter(m => m.group_name === grp)
        .map(m => ({ home: m.home_team, away: m.away_team, home_score: m.home_score, away_score: m.away_score }));
      allStandings[grp] = calcGroupStandings(teams, rows);
    });

    const first = {}, second = {};
    Object.entries(allStandings).forEach(([g, rows]) => { first[g] = rows[0].team; second[g] = rows[1].team; });
    const best8 = getBestThirdPlace(allStandings);
    const thirdSlotIds = [74, 77, 79, 80, 81, 82, 85, 87];

    db.data.matches.filter(m => m.stage === 'r32').forEach(m => {
      const resolveSlot = (slot) => {
        const m1 = slot?.match(/^1st ([A-L])$/); if (m1) return first[m1[1]];
        const m2 = slot?.match(/^2nd ([A-L])$/); if (m2) return second[m2[1]];
        return null;
      };
      m.home_team = resolveSlot(m.home_slot);
      if (m.away_slot === '3rd *') {
        const idx = thirdSlotIds.indexOf(m.id);
        m.away_team = idx >= 0 ? (best8[idx]?.team ?? null) : null;
      } else {
        m.away_team = resolveSlot(m.away_slot);
      }
    });

    await db.write();
    res.json({ success: true, standings: allStandings, best8Third: best8 });
  });

  // Manually set teams for any match
  router.post('/set-teams', requireAdmin, async (req, res) => {
    const { match_id, home_team, away_team } = req.body;
    const m = db.data.matches.find(m => m.id === match_id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    m.home_team = home_team ?? m.home_team;
    m.away_team = away_team ?? m.away_team;
    await db.write();
    res.json({ success: true });
  });

  // Auto-advance winners into next rounds
  router.post('/advance-winners', requireAdmin, async (req, res) => {
    const winnerMap = {}, loserMap = {};
    db.data.matches.filter(m => m.status === 'finished' && m.winner).forEach(m => {
      winnerMap[`W${m.id}`] = m.winner;
      const loser = m.winner === m.home_team ? m.away_team : m.home_team;
      if (loser) loserMap[`L${m.id}`] = loser;
    });
    db.data.matches.filter(m => ['r16','qf','sf','final','third'].includes(m.stage)).forEach(m => {
      m.home_team = winnerMap[m.home_slot] ?? loserMap[m.home_slot] ?? m.home_team;
      m.away_team = winnerMap[m.away_slot] ?? loserMap[m.away_slot] ?? m.away_team;
    });
    await db.write();
    res.json({ success: true });
  });

  return router;
};
