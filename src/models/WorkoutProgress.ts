import mongoose from 'mongoose';

const workoutProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  goalId: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  completed: { 
    type: Number, 
    required: true,
    default: 0
  },
  total: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  date: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index on userId, goalId and date for efficient querying
workoutProgressSchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

// Check if the model exists before creating a new one
export default mongoose.models.WorkoutProgress || mongoose.model('WorkoutProgress', workoutProgressSchema); 