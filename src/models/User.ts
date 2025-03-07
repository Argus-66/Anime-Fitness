import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  theme: {
    type: String,
    default: 'solo-leveling',
  },
  coins: {
    type: Number,
    default: 0,
  },
  progression: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  skills: {
    strength: { type: Number, default: 1 },
    agility: { type: Number, default: 1 },
    endurance: { type: Number, default: 1 },
  },
  workouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  }],
  badges: [{
    type: String,
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  cardsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }],
});

export default mongoose.models.User || mongoose.model('User', userSchema); 