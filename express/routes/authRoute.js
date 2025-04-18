const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  getUserProgress,
  updateQuestProgress,
  updateSecurityScore,
  unlockBadge
} = require('../controllers/AuthController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/progress', protect, getUserProgress);
router.post('/progress', protect, updateQuestProgress);
router.put('/security-score', protect, updateSecurityScore);
router.post('/badges', protect, unlockBadge);

module.exports = router;