require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (to be implemented)
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/artists', require('./routes/artists'));
app.use('/api/v1/releases', require('./routes/releases'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/branding', require('./routes/branding'));
app.use('/api/v1/distribution', require('./routes/distribution'));
app.use('/api/v1/monetization', require('./routes/monetization'));
app.use('/api/v1/manufacturing', require('./routes/manufacturing'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`ArtistOS API running on port ${PORT}`);
});

module.exports = app;