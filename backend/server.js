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

// MongoDB connection with environment variable support
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected to:', MONGODB_URI);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const organizationRoutes = require('./routes/organization');
const onboardingRoutes = require('./routes/onboarding');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const payrollRoutes = require('./routes/payroll');
const dashboardRoutes = require('./routes/dashboard');

// Health check
app.get('/', (_req, res) => res.json({ ok: true, message: 'HRMS API is running' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Legacy API router (if needed)
app.use('/api', apiRouter);

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
