import mongoose from 'mongoose';

const workoutGoalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  unit: { 
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

// Create compound index on userId and type for efficient querying
workoutGoalSchema.index({ userId: 1, type: 1 });

// Check if the model exists before creating a new one
export default mongoose.models.WorkoutGoal || mongoose.model('WorkoutGoal', workoutGoalSchema); 