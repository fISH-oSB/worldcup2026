const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) => {
    const rows = db.data.users.map(user => {
      const preds = db.data.predictions.filter(p => p.user_id === user.id);
      const pts = (stage) => preds
        .filter(p => { const m = db.data.matches.find(m => m.id === p.match_id); return m?.stage === stage; })
        .reduce((s, p) => s + (p.points || 0), 0);

      const finalPts = preds
        .filter(p => { const m = db.data.matches.find(m => m.id === p.match_id); return m?.stage === 'final' || m?.stage === 'third'; })
        .reduce((s, p) => s + (p.points || 0), 0);

      const total = preds.reduce((s, p) => s + (p.points || 0), 0);
      return {
        id: user.id,
        name: user.name,
        total_points: total,
        group_pts: pts('group'),
        r32_pts: pts('r32'),
        r16_pts: pts('r16'),
        qf_pts: pts('qf'),
        sf_pts: pts('sf'),
        final_pts: finalPts,
      };
    }).sort((a, b) => b.total_points - a.total_points || a.name.localeCompare(b.name));

    let rank = 1;
    rows.forEach((row, i) => {
      if (i > 0 && row.total_points < rows[i - 1].total_points) rank = i + 1;
      row.rank = rank;
    });

    res.json(rows);
  });
  return router;
};
