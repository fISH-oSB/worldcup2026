const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initDB } = require('./db');

const PORT = process.env.PORT || 3001;

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
  app.use('/api/sync',        require('./routes/sync')(db));

  // Serve built frontend in production
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`⚽  World Cup 2026 server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
