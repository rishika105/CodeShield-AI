const User = require("../models/User");
const { generateToken } = require("../services/authService");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error("User already exists with this email or username");
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        securityScore: user.securityScore,
        badges: user.badges,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No user found with this email");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        securityScore: user.securityScore,
        badges: user.badges,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};


// ... existing code ...

exports.getUserProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('securityQuests');
    res.json({
      success: true,
      securityQuests: user.securityQuests
    });
  } catch (err) {
    next(err);
  }
};

exports.updateQuestProgress = async (req, res, next) => {
  try {
    const { questId, points, isConsecutiveDay, currentStreak } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Update quest progress
    user.securityQuests.completedQuests.push({
      questId,
      earnedXP: points,
      completedAt: new Date()
    });
    
    // Update streaks and XP
    user.securityQuests.totalXP += points;
    user.securityQuests.currentStreak = isConsecutiveDay ? currentStreak : 1;
    user.securityQuests.maxStreak = Math.max(
      user.securityQuests.maxStreak,
      user.securityQuests.currentStreak
    );
    user.securityQuests.lastCompletedDate = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      securityQuests: user.securityQuests
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSecurityScore = async (req, res, next) => {
  try {
    const { score } = req.body;
    
    const user = await User.findById(req.user.id);
    user.securityScore = score;
    await user.save();
    
    res.json({
      success: true,
      securityScore: user.securityScore
    });
  } catch (err) {
    next(err);
  }
};

exports.unlockBadge = async (req, res, next) => {
  try {
    const { badgeId } = req.body;
    
    const user = await User.findById(req.user.id);
    user.securityQuests.earnedBadges.push({
      badgeId,
      earnedAt: new Date()
    });
    await user.save();
    
    res.json({
      success: true,
      earnedBadges: user.securityQuests.earnedBadges
    });
  } catch (err) {
    next(err);
  }
};