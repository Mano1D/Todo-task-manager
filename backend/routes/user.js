const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware'); // Adjust path if needed

// Fetch user info
router.get('/', verifyToken, async (req, res) => {
  try {
    // Assuming user data is in req.user (decoded from token)
    res.json({
      name: req.user.name,
      email: req.user.email
    });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

module.exports = router;
