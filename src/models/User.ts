import mongoose from 'mongoose';

// Check if the model is already defined to prevent OverwriteModelError
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  // Add top-level properties
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  gender: { type: String, default: '' },
  // Keep the details object for backward compatibility
  details: {
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    age: { type: Number, default: 0 }
  },
  progression: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  stats: {
    workoutsCompleted: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 }
  },
  friends: {
    type: [{
      username: String,
      level: Number
    }],
    default: []
  },
  recentWorkouts: {
    type: [{
      date: Date,
      name: String,
      duration: Number,
      xpGained: Number
    }],
    default: []
  },
  joinedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  theme: { type: String, default: 'solo-leveling' },
  coins: { type: Number, default: 0 }
});

// Create text index on username for efficient searching
userSchema.index({ username: 'text' });

// Check if the model exists before creating a new one
export default mongoose.models.User || mongoose.model('User', userSchema); 