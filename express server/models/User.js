const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  securityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  badges: [{
    type: String,
    enum: ['rookie', 'guardian', 'expert', 'master', 'legend']
  }],
  lastScanDate: {
    type: Date,
    default: null
  },
  scanCount: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update security score method
userSchema.methods.updateSecurityScore = function(newScore) {
  this.securityScore = Math.min(100, Math.max(0, newScore));
  this.scanCount += 1;
  this.lastScanDate = new Date();
  
  // Update badges based on score
  this.badges = [];
  if (this.securityScore >= 20) this.badges.push('rookie');
  if (this.securityScore >= 50) this.badges.push('guardian');
  if (this.securityScore >= 70) this.badges.push('expert');
  if (this.securityScore >= 90) this.badges.push('master');
  if (this.securityScore === 100) this.badges.push('legend');
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);