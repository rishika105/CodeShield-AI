// routes/quests.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Complete a quest
router.post('/complete', async (req, res) => {
  try {
    const { userId, questId, xp } = req.body;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if already completed
    if (user.securityQuests.completedQuests.some(q => q.questId === questId)) {
      return res.status(400).json({ error: 'Quest already completed' });
    }
    
    // Update streak
    const today = new Date();
    const lastCompleted = user.securityQuests.lastCompletedDate || new Date(0);
    const isNewDay = today.toDateString() !== lastCompleted.toDateString();
    const isConsecutiveDay = isNewDay && 
      (today - lastCompleted) <= 86400000 * 1.5; // ~1.5 days
    
    // Update user progress
    user.securityQuests.completedQuests.push({
      questId,
      completedAt: today,
      earnedXP: xp
    });
    
    user.securityQuests.totalXP += xp;
    user.securityQuests.currentStreak = isConsecutiveDay 
      ? user.securityQuests.currentStreak + 1 
      : 1;
    user.securityQuests.maxStreak = Math.max(
      user.securityQuests.maxStreak,
      isConsecutiveDay ? user.securityQuests.currentStreak + 1 : 1
    );
    user.securityQuests.lastCompletedDate = today;
    
    // Check for badge unlocks
    const completedCount = user.securityQuests.completedQuests.length;
    if (completedCount === 1 && !user.securityQuests.earnedBadges.some(b => b.badgeId === 1)) {
      user.securityQuests.earnedBadges.push({
        badgeId: 1,
        earnedAt: today
      });
    }
    // Add more badge checks...
    
    await user.save();
    
    res.json({
      success: true,
      totalXP: user.securityQuests.totalXP,
      currentStreak: user.securityQuests.currentStreak,
      earnedBadges: user.securityQuests.earnedBadges
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;