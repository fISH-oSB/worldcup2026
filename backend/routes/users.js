const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) => {
    const users = [...db.data.users].sort((a, b) => a.name.localeCompare(b.name));
    res.json(users);
  });
  return router;
};
