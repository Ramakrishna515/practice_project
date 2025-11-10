const { Router } = require('express');
const mongoose = require('mongoose');
const { signupSchema } = require('./Model.js');

const router = Router();
const User = mongoose.models.User || mongoose.model('User', signupSchema);

// POST /api/signup (create new user)
router.post('/signup', async (req, res) => {
  try {
    let { username, email, password, confirmPassword } = req.body || {};

    if (typeof email === 'string') email = email.trim().toLowerCase();
    if (typeof username === 'string') username = username.trim();

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const [userByName, userByEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);
    if (userByName) return res.status(409).json({ message: 'Username already exists' });
    if (userByEmail) return res.status(409).json({ message: 'Email already registered' });

    const doc = await User.create({ username, email, password, confirmPassword });

    return res.status(201).json({
      message: 'User created',
      user: { _id: doc._id, username: doc.username, email: doc.email },
    });
  } catch (err) {
    // handle Mongo duplicate key too
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `${field} already registered` });
    }
    console.error('POST /signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/userDetails?username=Chinna  (optional filter)
router.get('/userDetails', async (req, res) => {
  try {
    const search = req.query.username;
    const filter = search ? { username: { $regex: search, $options: "i" } } : {}
    const users = await User.find(filter, { username: 1, email: 1 });

    console.log("users --->", users);

    return res.json(users);
  } catch (err) {
    console.error("GET /userDetails error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/userDetails/:username  (path param)
router.get('/userDetails/:username', async (req, res) => {
  try {
    const users = await User.find(
      { username: req.params.username },
      { username: 1, email: 1 }
    ).lean();
    return res.json(users);
  } catch (err) {
    console.error('GET /userDetails/:username error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
