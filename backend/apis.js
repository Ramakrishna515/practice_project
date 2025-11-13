// routes.js
const { Router } = require('express');
const mongoose = require('mongoose');
const { signupSchema } = require('./Model.js'); 
const router = Router();
const User = mongoose.models.User || mongoose.model('User', signupSchema);

const fail = (res, code, message, extra = {}) =>
  res.status(200).json({ status: 'ERROR', code, message, ...extra });

const ok = (res, payload = {}) =>
  res.status(200).json({ status: 'SUCCESS', ...payload });

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    let { username, email, password, confirmPassword } = req.body || {};

    if (typeof username === 'string') username = username.trim();
    if (typeof email === 'string') email = email.trim().toLowerCase();

    if (!username || !email || !password || !confirmPassword) {
      return fail(res, 'MISSING_FIELDS', 'All fields are required');
    }

    if (password !== confirmPassword) {
      return fail(res, 'PASSWORD_MISMATCH', 'Passwords do not match', { field: 'confirmPassword' });
    }

    const [userByName, userByEmail] = await Promise.all([
      User.findOne({ username }).lean(),
      User.findOne({ email }).lean(),
    ]);

    if (userByName) {
      return fail(res, 'USERNAME_TAKEN', 'Username already exists', { field: 'username' });
    }
    if (userByEmail) {
      return fail(res, 'EMAIL_TAKEN', 'Email already registered', { field: 'email' });
    }

    const doc = await User.create({ username, email, password, confirmPassword });

    return ok(res, {
      message: 'User created',
      user: { _id: doc._id, username: doc.username, email: doc.email },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return fail(res, 'DUPLICATE_KEY', `${field} already registered`, { field });
    }
    console.error('POST /api/signup error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Server error' });
  }
});

// GET /api/userDetails?username=Chinna
router.get('/userDetails', async (req, res) => {
  try {
    const search = req.query.username;
    const filter = search ? { username: { $regex: search, $options: 'i' } } : {};
    const users = await User.find(filter, { username: 1, email: 1 }).lean();
    return ok(res, { users });
  } catch (err) {
    console.error('GET /userDetails error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Server error' });
  }
});

// GET /api/userDetails/:username
router.get('/userDetails/:username', async (req, res) => {
  try {
    const users = await User.find(
      { username: req.params.username },
      { username: 1, email: 1 }
    ).lean();
    return ok(res, { users });
  } catch (err) {
    console.error('GET /userDetails/:username error:', err);
    return res.status(500).json({ status: 'ERROR', message: 'Server error' });
  }
});

module.exports = router;
