// Calculates group standings from match results
// Official 2026 FIFA World Cup tiebreaker order:
//   1. Points  2. GD  3. GF  4. Head-to-head pts  5. H2H GD  6. H2H GF  7. FIFA ranking (seed order)

function calcGroupStandings(teams, matches) {
  const table = {};
  teams.forEach((t, i) => {
    table[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, seed: i };
  });

  const played = matches.filter(m => m.home_score !== null && m.away_score !== null);

  played.forEach(m => {
    const h = table[m.home], a = table[m.away];
    if (!h || !a) return;
    h.played++; a.played++;
    h.gf += m.home_score; h.ga += m.away_score;
    a.gf += m.away_score; a.ga += m.home_score;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
    if (m.home_score > m.away_score)      { h.won++; h.pts += 3; a.lost++; }
    else if (m.home_score < m.away_score) { a.won++; a.pts += 3; h.lost++; }
    else                                  { h.drawn++; h.pts++; a.drawn++; a.pts++; }
  });

  const rows = Object.values(table);

  // Head-to-head builder for tied groups
  function h2hStats(tied, allMatches) {
    const stats = {};
    tied.forEach(t => { stats[t] = { pts: 0, gd: 0, gf: 0 }; });
    allMatches.filter(m =>
      tied.includes(m.home) && tied.includes(m.away) &&
      m.home_score !== null
    ).forEach(m => {
      if (m.home_score > m.away_score)      { stats[m.home].pts += 3; }
      else if (m.home_score < m.away_score) { stats[m.away].pts += 3; }
      else { stats[m.home].pts++; stats[m.away].pts++; }
      stats[m.home].gd += m.home_score - m.away_score;
      stats[m.away].gd += m.away_score - m.home_score;
      stats[m.home].gf += m.home_score;
      stats[m.away].gf += m.away_score;
    });
    return stats;
  }

  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    // Head-to-head between these two
    const h2h = h2hStats([a.team, b.team], played);
    if (h2h[b.team].pts !== h2h[a.team].pts) return h2h[b.team].pts - h2h[a.team].pts;
    if (h2h[b.team].gd  !== h2h[a.team].gd)  return h2h[b.team].gd  - h2h[a.team].gd;
    if (h2h[b.team].gf  !== h2h[a.team].gf)  return h2h[b.team].gf  - h2h[a.team].gf;
    // Fall back to FIFA seed order
    return a.seed - b.seed;
  });

  return rows;
}

// Returns the best 8 third-place teams from all 12 groups
function getBestThirdPlace(allGroupStandings) {
  const thirds = Object.entries(allGroupStandings).map(([grp, rows]) => ({
    group: grp,
    ...rows[2], // 3rd place team
  })).filter(t => t.team);

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    return a.seed - b.seed;
  });

  return thirds.slice(0, 8);
}

module.exports = { calcGroupStandings, getBestThirdPlace };
