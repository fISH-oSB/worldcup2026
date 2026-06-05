import { GROUPS } from '../data/matches';

// ── Group standings ───────────────────────────────────────────────────────────
function calcStandings(teams, matches) {
  const table = {};
  teams.forEach((t, i) => {
    table[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, seed: i };
  });
  matches.filter(m => m.home_score !== null && m.away_score !== null).forEach(m => {
    const h = table[m.home], a = table[m.away];
    if (!h || !a) return;
    h.played++; a.played++;
    h.gf += m.home_score; h.ga += m.away_score;
    a.gf += m.away_score; a.ga += m.home_score;
    h.gd = h.gf - h.ga;   a.gd = a.gf - a.ga;
    if (m.home_score > m.away_score)      { h.won++; h.pts += 3; a.lost++; }
    else if (m.home_score < m.away_score) { a.won++; a.pts += 3; h.lost++; }
    else                                  { h.drawn++; h.pts++;  a.drawn++; a.pts++; }
  });
  return Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    return a.seed - b.seed;
  });
}

export function buildPredictedStandings(groupLetter, groupMatches, predictions) {
  const teams = GROUPS[groupLetter];
  if (!teams) return [];
  const withScores = groupMatches
    .filter(m => m.group_name === groupLetter)
    .map(m => {
      const pred = predictions[m.id];
      return { home: m.home_team, away: m.away_team, home_score: pred?.pred_home ?? null, away_score: pred?.pred_away ?? null };
    });
  return calcStandings(teams, withScores);
}

export function buildAllPredictedStandings(groupMatches, predictions) {
  const result = {};
  Object.keys(GROUPS).forEach(g => { result[g] = buildPredictedStandings(g, groupMatches, predictions); });
  return result;
}

// Best 8 third-place teams from all group standings
function getBestThird(allStandings) {
  return Object.entries(allStandings)
    .map(([grp, rows]) => rows[2] ? { group: grp, ...rows[2] } : null)
    .filter(Boolean)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd  !== a.gd)  return b.gd  - a.gd;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      return a.seed - b.seed;
    })
    .slice(0, 8);
}

// R32 match IDs whose away-slot is a "3rd *" wildcard (in bracket order)
const THIRD_SLOT_IDS = [74, 77, 79, 80, 81, 82, 85, 87];

// R32 → R16 feed map (which two R32 matches feed each R16 match)
const R32_FEEDS_R16 = {
  90: [73, 75], 89: [74, 77], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 96: [85, 87], 95: [86, 88],
};
const R16_FEEDS_QF = {
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
};
const QF_FEEDS_SF = {
  101: [97, 98], 102: [99, 100],
};

// ── Flowing bracket ───────────────────────────────────────────────────────────
// Builds a complete set of predicted teams for every knockout match
// based on who the user picked to win each round.
export function buildFlowingBracket(knockoutMatches, predictions, predR32TeamMap) {
  const matchMap = {};
  knockoutMatches.forEach(m => { matchMap[m.id] = m; });

  // Always return the user's own predicted winner — never the official result.
  // Each person's bracket is purely their own predictions end-to-end.
  function getPickedWinner(matchId) {
    return predictions[matchId]?.pred_winner ?? null;
  }

  // Teams for each match (what two teams play)
  const teamsFor = {};

  // R32: always use the personal predicted standings — ignore official home_team/away_team
  // so each user sees their own group-stage predictions reflected in the bracket.
  knockoutMatches.filter(m => m.stage === 'r32').forEach(m => {
    const pred = predR32TeamMap?.[m.id];
    teamsFor[m.id] = {
      home: pred?.home ?? null,
      away: pred?.away ?? null,
    };
  });

  // R16: teams are the winners of the two feeding R32 matches
  Object.entries(R32_FEEDS_R16).forEach(([r16Id, [feedA, feedB]]) => {
    teamsFor[parseInt(r16Id)] = {
      home: getPickedWinner(feedA),
      away: getPickedWinner(feedB),
    };
  });

  // QF: teams are the winners of the two feeding R16 matches
  Object.entries(R16_FEEDS_QF).forEach(([qfId, [feedA, feedB]]) => {
    teamsFor[parseInt(qfId)] = {
      home: getPickedWinner(feedA),
      away: getPickedWinner(feedB),
    };
  });

  // SF: teams from QF winners
  Object.entries(QF_FEEDS_SF).forEach(([sfId, [feedA, feedB]]) => {
    teamsFor[parseInt(sfId)] = {
      home: getPickedWinner(feedA),
      away: getPickedWinner(feedB),
    };
  });

  // Final: SF winners
  teamsFor[104] = {
    home: getPickedWinner(101),
    away: getPickedWinner(102),
  };

  // 3rd place: SF losers
  function getSFLoser(sfId) {
    const t = teamsFor[sfId];
    const w = getPickedWinner(sfId);
    if (!w || !t) return null;
    return w === t.home ? t.away : t.home;
  }
  teamsFor[103] = {
    home: getSFLoser(101),
    away: getSFLoser(102),
  };

  return teamsFor;
}

// Build R32 team map from predicted group standings
export function buildPredictedBracket(knockoutMatches, allPredStandings) {
  const first = {}, second = {};
  Object.entries(allPredStandings).forEach(([g, rows]) => {
    if (rows[0]) first[g]  = rows[0].team;
    if (rows[1]) second[g] = rows[1].team;
  });

  const best8 = getBestThird(allPredStandings);

  const resolveSlot = (slot, matchId) => {
    const m1 = slot?.match(/^1st ([A-L])$/); if (m1) return first[m1[1]]  || null;
    const m2 = slot?.match(/^2nd ([A-L])$/); if (m2) return second[m2[1]] || null;
    if (slot === '3rd *') {
      const idx = THIRD_SLOT_IDS.indexOf(matchId);
      return idx >= 0 ? (best8[idx]?.team ?? null) : null;
    }
    return null;
  };

  const teamMap = {};
  knockoutMatches.filter(m => m.stage === 'r32').forEach(m => {
    // Always resolve from predicted standings — never use the official home_team/away_team
    teamMap[m.id] = {
      home: resolveSlot(m.home_slot, m.id),
      away: m.away_slot === '3rd *'
        ? resolveSlot('3rd *', m.id)
        : resolveSlot(m.away_slot, m.id),
    };
  });

  return { teamMap, first, second, best8 };
}
