// Pure-JS JSON file database using lowdb v2 (no native compilation needed)
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const { GROUP_MATCHES, KNOCKOUT_MATCHES, USERS } = require('./data/matches');

const DB_PATH = path.join(__dirname, 'worldcup.json');

let _db = null;

async function initDB() {
  if (_db) return _db;

  const adapter = new JSONFile(DB_PATH);
  const db = new Low(adapter);
  await db.read();

  // Default structure
  db.data ||= { users: [], matches: [], predictions: [], _nextPredId: 1 };

  // Seed users on first run; on subsequent runs only ADD new names (never remove or reset)
  if (db.data.users.length === 0) {
    db.data.users = USERS.map((name, i) => ({ id: i + 1, name }));
  } else {
    const existingNames = new Set(db.data.users.map(u => u.name));
    const maxId = db.data.users.reduce((m, u) => Math.max(m, u.id), 0);
    let nextId = maxId + 1;
    USERS.forEach(name => {
      if (!existingNames.has(name)) {
        db.data.users.push({ id: nextId++, name });
      }
    });
  }

  // Seed matches
  if (db.data.matches.length === 0) {
    const groupRows = GROUP_MATCHES.map(m => ({
      id: m.id,
      stage: 'group',
      group_name: m.group,
      match_num: null,
      home_team: m.home,
      away_team: m.away,
      home_slot: null,
      away_slot: null,
      datetime: m.datetime,
      venue: m.venue,
      home_score: null,
      away_score: null,
      winner: null,
      status: 'upcoming',
    }));
    const koRows = KNOCKOUT_MATCHES.map(m => ({
      id: m.id,
      stage: m.stage,
      group_name: null,
      match_num: m.matchNum,
      home_team: null,
      away_team: null,
      home_slot: m.home_slot,
      away_slot: m.away_slot,
      datetime: m.datetime,
      venue: m.venue,
      home_score: null,
      away_score: null,
      winner: null,
      status: 'upcoming',
    }));
    db.data.matches = [...groupRows, ...koRows];
  }

  await db.write();
  _db = db;
  return db;
}

module.exports = { initDB };
