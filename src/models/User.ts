import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
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
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema); 