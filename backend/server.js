// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRouter = require('./apis.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsConfig = { origin: true, credentials: true };
app.use(cors(corsConfig));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/myapp');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

app.get('/', (_req, res) => res.json({ ok: true }));

app.use('/api', apiRouter);

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
