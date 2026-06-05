const express = require('express');
const router = express.Router();
const { GROUPS } = require('../data/matches');
const { calcGroupStandings, getBestThirdPlace } = require('../utils/standings');

module.exports = (db) => {
  router.get('/standings/all', (req, res) => {
    const gm = db.data.matches.filter(m => m.stage === 'group');
    const result = {};
    Object.entries(GROUPS).forEach(([grp, teams]) => {
      const rows = gm.filter(m => m.group_name === grp)
        .map(m => ({ home: m.home_team, away: m.away_team, home_score: m.home_score, away_score: m.away_score }));
      result[grp] = calcGroupStandings(teams, rows);
    });
    res.json(result);
  });

  router.get('/standings/third', (req, res) => {
    const gm = db.data.matches.filter(m => m.stage === 'group');
    const all = {};
    Object.entries(GROUPS).forEach(([grp, teams]) => {
      const rows = gm.filter(m => m.group_name === grp)
        .map(m => ({ home: m.home_team, away: m.away_team, home_score: m.home_score, away_score: m.away_score }));
      all[grp] = calcGroupStandings(teams, rows);
    });
    res.json(getBestThirdPlace(all));
  });

  router.get('/:id', (req, res) => {
    const m = db.data.matches.find(m => m.id === parseInt(req.params.id));
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m);
  });

  router.get('/', (req, res) => {
    let list = db.data.matches;
    if (req.query.stage) list = list.filter(m => m.stage === req.query.stage);
    if (req.query.group) list = list.filter(m => m.group_name === req.query.group);
    res.json([...list].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)));
  });

  return router;
};
