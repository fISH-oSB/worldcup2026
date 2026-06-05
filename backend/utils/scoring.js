const { KNOCKOUT_POINTS } = require('../data/matches');

// Score a group-stage prediction (0, 1 or 2 pts)
function scoreGroupPrediction(pred, actual) {
  if (actual.home_score === null || actual.away_score === null) return 0;
  if (pred.pred_home === null || pred.pred_away === null) return 0;

  const actualResult = Math.sign(actual.home_score - actual.away_score);
  const predResult   = Math.sign(pred.pred_home   - pred.pred_away);
  if (actualResult !== predResult) return 0;

  return (pred.pred_home === actual.home_score && pred.pred_away === actual.away_score) ? 2 : 1;
}

// Score a knockout prediction by TEAM NAME across the whole stage.
// Rule: if the team you predicted to win advanced (won any match in this stage), you score.
// This means predictions earn points even if the team ends up in a different bracket position.
function scoreKnockoutPrediction(pred, stageMatches, stage) {
  if (!pred.pred_winner) return 0;
  const pts = KNOCKOUT_POINTS[stage] || 0;
  const teamWon = stageMatches.some(m => m.status === 'finished' && m.winner === pred.pred_winner);
  return teamWon ? pts : 0;
}

module.exports = { scoreGroupPrediction, scoreKnockoutPrediction };
