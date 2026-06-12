const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initDB } = require('./db');

const PORT          = process.env.PORT || 3001;
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL_MS) || 5 * 60 * 1000; // 5 min default

async function start() {
  const db = await initDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/users',       require('./routes/users')(db));
  app.use('/api/matches',     require('./routes/matches')(db));
  app.use('/api/predictions', require('./routes/predictions')(db));
  app.use('/api/leaderboard', require('./routes/leaderboard')(db));
  app.use('/api/admin',       require('./routes/admin')(db));

  const syncRouter = require('./routes/sync');
  app.use('/api/sync', syncRouter(db));

  // Serve built frontend in production
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`⚽  World Cup 2026 server running on http://localhost:${PORT}`);
  });

  // ── Auto-sync from ESPN every 5 minutes ────────────────────────────────────
  const { syncTodayAndYesterday } = syncRouter;

  async function runAutoSync() {
    try {
      const { updated, errors } = await syncTodayAndYesterday(db);
      if (updated.length > 0) {
        console.log(`[auto-sync] Updated ${updated.length} match(es):`,
          updated.map(m => `${m.home} ${m.homeScore}-${m.awayScore} ${m.away}`).join(', '));
      } else {
        console.log(`[auto-sync] ${new Date().toISOString()} — no new results`);
      }
      if (errors.length > 0) console.warn('[auto-sync] errors:', errors);
    } catch (e) {
      console.error('[auto-sync] failed:', e.message);
    }
  }

  // Run once on startup, then on interval
  runAutoSync();
  setInterval(runAutoSync, SYNC_INTERVAL);
  console.log(`⏱  Auto-sync enabled every ${SYNC_INTERVAL / 60000} minute(s)`);
}

start().catch(console.error);
