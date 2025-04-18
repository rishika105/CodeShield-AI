const User = require('../models/User');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ 
        'securityScore': -1,
        'securityQuests.totalXP': -1 
      })
      .limit(50)
      .select('username email securityScore badges securityQuests');
    console.log(users);
    res.json(users);
    
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
};