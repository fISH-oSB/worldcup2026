const express = require('express');
const router = express.Router();
const { scoreGroupPrediction, scoreKnockoutPrediction } = require('../utils/scoring');

module.exports = (db) => {
  router.get('/user/:userId', (req, res) => {
    const uid = parseInt(req.params.userId);
    const preds = db.data.predictions.filter(p => p.user_id === uid).map(p => {
      const m = db.data.matches.find(m => m.id === p.match_id);
      return { ...p, ...m, match_id: p.match_id, id: p.id };
    });
    res.json(preds);
  });

  router.post('/', async (req, res) => {
    const { user_id, match_id, pred_home, pred_away, pred_winner } = req.body;
    if (!user_id || !match_id) return res.status(400).json({ error: 'user_id and match_id required' });

    const match = db.data.matches.find(m => m.id === match_id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status === 'finished') return res.status(400).json({ error: 'Match already finished' });

    let points = 0;
    if (match.stage === 'group') {
      points = scoreGroupPrediction({ pred_home, pred_away }, match);
    } else {
      points = scoreKnockoutPrediction({ pred_winner }, match, match.stage);
    }

    const existing = db.data.predictions.find(p => p.user_id === user_id && p.match_id === match_id);
    if (existing) {
      existing.pred_home = pred_home ?? null;
      existing.pred_away = pred_away ?? null;
      existing.pred_winner = pred_winner ?? null;
      existing.points = points;
    } else {
      db.data.predictions.push({
        id: db.data._nextPredId++,
        user_id,
        match_id,
        pred_home: pred_home ?? null,
        pred_away: pred_away ?? null,
        pred_winner: pred_winner ?? null,
        points,
      });
    }
    await db.write();
    res.json({ success: true, points });
  });

  router.post('/bulk', async (req, res) => {
    const { user_id, predictions } = req.body;
    if (!user_id || !Array.isArray(predictions)) {
      return res.status(400).json({ error: 'user_id and predictions[] required' });
    }
    for (const p of predictions) {
      const match = db.data.matches.find(m => m.id === p.match_id);
      if (!match || match.status === 'finished') continue;
      const existing = db.data.predictions.find(x => x.user_id === user_id && x.match_id === p.match_id);
      if (existing) {
        existing.pred_home = p.pred_home ?? null;
        existing.pred_away = p.pred_away ?? null;
        existing.pred_winner = p.pred_winner ?? null;
      } else {
        db.data.predictions.push({
          id: db.data._nextPredId++,
          user_id,
          match_id: p.match_id,
          pred_home: p.pred_home ?? null,
          pred_away: p.pred_away ?? null,
          pred_winner: p.pred_winner ?? null,
          points: 0,
        });
      }
    }
    await db.write();
    res.json({ success: true, saved: predictions.length });
  });

  return router;
};
