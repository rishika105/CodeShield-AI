const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserProfile } = require('../controllers/UserController');
const { protect } = require('../middlewares/auth');

router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', protect, getUserProfile);

module.exports = router;