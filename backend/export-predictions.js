/**
 * Export all predictions to Excel — one sheet per user.
 * Run from the backend/ folder: node export-predictions.js
 * Output: ../predictions-backup-<date>.xlsx
 */

const fs   = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH  = path.join(DATA_DIR, 'worldcup.json');
if (!fs.existsSync(DB_PATH)) {
  console.error('worldcup.json not found — run the server at least once first.');
  process.exit(1);
}

const db      = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const users   = db.users   || [];
const matches = db.matches || [];
const preds   = db.predictions || [];

const wb = XLSX.utils.book_new();

users.forEach(user => {
  const userPreds = preds.filter(p => p.user_id === user.id);

  const rows = matches.map(m => {
    const p = userPreds.find(p => p.match_id === m.id);
    return {
      'Match ID':       m.id,
      'Stage':          m.stage,
      'Group':          m.group_name ?? '',
      'Home Team':      m.home_team  ?? m.home_slot ?? '',
      'Away Team':      m.away_team  ?? m.away_slot ?? '',
      'Match Date':     m.datetime   ?? '',
      'Venue':          m.venue      ?? '',
      'Pred Home':      p?.pred_home  ?? '',
      'Pred Away':      p?.pred_away  ?? '',
      'Pred Winner':    p?.pred_winner ?? '',
      'Points Earned':  p?.points     ?? '',
      'Official Score': m.home_score !== null ? `${m.home_score}-${m.away_score}` : '',
      'Official Status':m.status     ?? '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 22 }, { wch: 22 },
    { wch: 22 }, { wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 22 },
    { wch: 12 }, { wch: 14 }, { wch: 14 },
  ];

  // Safe sheet name (max 31 chars, no special chars)
  const sheetName = user.name.replace(/[:\\/?*[\]]/g, '').substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
});

// Summary sheet
const summaryRows = users.map(u => {
  const count   = preds.filter(p => p.user_id === u.id).length;
  const points  = preds.filter(p => p.user_id === u.id).reduce((s, p) => s + (p.points || 0), 0);
  return { 'Name': u.name, 'User ID': u.id, 'Predictions Made': count, 'Total Points': points };
});
const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
summaryWs['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 18 }, { wch: 14 }];
XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

const date     = new Date().toISOString().slice(0, 10);
const outPath  = path.join(__dirname, '..', `predictions-backup-${date}.xlsx`);
XLSX.writeFile(wb, outPath);

console.log(`✅  Exported ${preds.length} predictions across ${users.length} users.`);
console.log(`📁  Saved to: ${outPath}`);
