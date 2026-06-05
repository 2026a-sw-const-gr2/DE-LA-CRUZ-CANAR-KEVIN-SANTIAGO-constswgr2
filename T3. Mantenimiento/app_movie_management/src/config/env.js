const path = require('path');
require('dotenv').config();

const DEFAULT_API_KEY = 'FIS-EPN-2026';

const dataDir = process.env.PELICULAS_DATA_DIR
  ? path.resolve(process.env.PELICULAS_DATA_DIR)
  : path.join(__dirname, '..', 'data');

const dbPath = process.env.PELICULAS_DB_PATH
  ? path.resolve(process.env.PELICULAS_DB_PATH)
  : path.join(dataDir, 'peliculas.sqlite');

const legacyPath = process.env.PELICULAS_LEGACY_PATH
  ? path.resolve(process.env.PELICULAS_LEGACY_PATH)
  : path.join(dataDir, 'peliculas.json');

module.exports = {
  port: Number(process.env.PORT) || 8080,
  apiKey: String(process.env.FIS_EPN_API_KEY || DEFAULT_API_KEY).trim(),
  dataDir,
  dbPath,
  legacyPath,
  eventManagerUrl: String(process.env.EPN_EVENT_MANAGER_URL || 'http://localhost:3000/events').trim(),
};