import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaSwimmer, FaBiking, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiJumpingRope, GiMeditation } from 'react-icons/gi';
import { MdFitnessCenter, MdDirectionsRun } from 'react-icons/md';

// Define workout types with their respective units and icons
const WORKOUT_TYPES = [
  { id: 'running', name: 'Running', unit: 'km', icon: FaRunning, category: 'cardio' },
  { id: 'cycling', name: 'Cycling', unit: 'km', icon: FaBiking, category: 'cardio' },
  { id: 'swimming', name: 'Swimming', unit: 'laps', icon: FaSwimmer, category: 'cardio' },
  { id: 'jump_rope', name: 'Jump Rope', unit: 'minutes', icon: GiJumpingRope, category: 'cardio' },
  { id: 'pushups', name: 'Push-ups', unit: 'reps', icon: GiMuscleUp, category: 'strength' },
  { id: 'pullups', name: 'Pull-ups', unit: 'reps', icon: GiMuscleUp, category: 'strength' },
  { id: 'squats', name: 'Squats', unit: 'reps', icon: MdFitnessCenter, category: 'strength' },
  { id: 'lunges', name: 'Lunges', unit: 'reps', icon: MdDirectionsRun, category: 'strength' },
  { id: 'plank', name: 'Plank', unit: 'seconds', icon: GiMuscleUp, category: 'strength' },
  { id: 'bench_press', name: 'Bench Press', unit: 'reps', icon: GiWeightLiftingUp, category: 'weights' },
  { id: 'deadlift', name: 'Deadlift', unit: 'reps', icon: GiWeightLiftingUp, category: 'weights' },
  { id: 'shoulder_press', name: 'Shoulder Press', unit: 'reps', icon: GiWeightLiftingUp, category: 'weights' },
  { id: 'bicep_curls', name: 'Bicep Curls', unit: 'reps', icon: GiWeightLiftingUp, category: 'weights' },
  { id: 'tricep_extensions', name: 'Tricep Extensions', unit: 'reps', icon: GiWeightLiftingUp, category: 'weights' },
  { id: 'yoga', name: 'Yoga', unit: 'minutes', icon: GiMeditation, category: 'flexibility' },
  { id: 'stretching', name: 'Stretching', unit: 'minutes', icon: GiMeditation, category: 'flexibility' },
];

// Group workout types by category
const WORKOUT_CATEGORIES = [
  { id: 'cardio', name: 'Cardio', icon: FaRunning },
  { id: 'strength', name: 'Strength', icon: GiMuscleUp },
  { id: 'weights', name: 'Weights', icon: GiWeightLiftingUp },
  { id: 'flexibility', name: 'Flexibility', icon: GiMeditation },
];

interface WorkoutGoal {
  id: string;
  type: string;
  amount: number;
  unit: string;
}

interface DailyWorkoutGoalsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
}

export default function DailyWorkoutGoals({ userId, username, isOwnProfile }: DailyWorkoutGoalsProps) {
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cardio');
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState<{
    type: string;
    amount: number;
  }>({
    type: WORKOUT_TYPES.find(w => w.category === 'cardio')?.id || '',
    amount: 1
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // Fetch user's workout goals on component mount
  useEffect(() => {
    const fetchWorkoutGoals = async () => {
      try {
        const response = await fetch(`/api/users/${username}/workout-goals`);
        if (response.ok) {
          const data = await response.json();
          setWorkoutGoals(data.workoutGoals || []);
        }
      } catch (error) {
        console.error('Failed to fetch workout goals:', error);
      }
    };

    fetchWorkoutGoals();
  }, [username]);

  const handleAddWorkout = () => {
    const workoutType = WORKOUT_TYPES.find(w => w.id === newWorkout.type);
    if (!workoutType) return;

    const newGoal: WorkoutGoal = {
      id: `${newWorkout.type}_${Date.now()}`,
      type: newWorkout.type,
      amount: newWorkout.amount,
      unit: workoutType.unit
    };

    setWorkoutGoals([...workoutGoals, newGoal]);
    setIsAddingWorkout(false);
    setNewWorkout({
      type: WORKOUT_TYPES.find(w => w.category === selectedCategory)?.id || '',
      amount: 1
    });
  };

  const handleRemoveWorkout = (id: string) => {
    setWorkoutGoals(workoutGoals.filter(goal => goal.id !== id));
  };

  const handleSaveGoals = async () => {
    if (!isOwnProfile) return;

    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });

    try {
      const response = await fetch(`/api/users/${username}/workout-goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workoutGoals }),
      });

      if (response.ok) {
        setSaveMessage({ 
          text: 'Your daily workout goals have been saved!', 
          type: 'success' 
        });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage({ text: '', type: '' });
        }, 3000);
      } else {
        throw new Error('Failed to save workout goals');
      }
    } catch (error) {
      console.error('Error saving workout goals:', error);
      setSaveMessage({ 
        text: 'Failed to save workout goals. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getWorkoutIcon = (typeId: string) => {
    const workoutType = WORKOUT_TYPES.find(w => w.id === typeId);
    if (!workoutType) return FaDumbbell;
    return workoutType.icon;
  };

  const getWorkoutName = (typeId: string) => {
    const workoutType = WORKOUT_TYPES.find(w => w.id === typeId);
    if (!workoutType) return 'Unknown';
    return workoutType.name;
  };

  const getWorkoutUnit = (typeId: string) => {
    const workoutType = WORKOUT_TYPES.find(w => w.id === typeId);
    if (!workoutType) return 'reps';
    return workoutType.unit;
  };

  return (
    <div className="bg-solo-dark/40 backdrop-blur-lg rounded-lg border border-solo-purple/30 p-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-solo-accent to-solo-purple bg-clip-text text-transparent mb-2">
          Daily Workout Goals
        </h3>
        <p className="text-solo-light/80 text-sm">
          Set your daily workout targets to track your progress and stay motivated.
        </p>
      </div>

      {/* Current workout goals */}
      <div className="mb-6">
        {workoutGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workoutGoals.map((goal) => {
              const Icon = getWorkoutIcon(goal.type);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-solo-purple/10 backdrop-blur-sm rounded-lg border border-solo-purple/30 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-solo-accent to-solo-purple rounded-full p-2 mr-3 shadow-glow-sm">
                      <Icon className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-white font-medium">{getWorkoutName(goal.type)}</div>
                      <div className="text-solo-light/80 text-sm">
                        {goal.amount} {goal.unit}
                      </div>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleRemoveWorkout(goal.id)}
                      className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors duration-200"
                      aria-label="Remove workout"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-solo-purple/5 rounded-lg border border-dashed border-solo-purple/20">
            <p className="text-solo-light/60">No daily workout goals set yet.</p>
            {isOwnProfile && (
              <p className="text-solo-light/80 text-sm mt-2">
                Add some goals below to start tracking your daily workouts!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add new workout section (only visible to profile owner) */}
      {isOwnProfile && (
        <>
          {isAddingWorkout ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-solo-purple/10 backdrop-blur-sm rounded-lg border border-solo-purple/30 p-4"
            >
              <h4 className="text-white font-medium mb-3">Add New Workout Goal</h4>
              
              {/* Workout category tabs */}
              <div className="flex overflow-x-auto mb-4 pb-2 scrollbar-thin scrollbar-thumb-solo-purple/30 scrollbar-track-transparent">
                {WORKOUT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setNewWorkout({
                        ...newWorkout,
                        type: WORKOUT_TYPES.find(w => w.category === category.id)?.id || ''
                      });
                    }}
                    className={`flex items-center px-4 py-2 rounded-full mr-2 whitespace-nowrap transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-solo-accent to-solo-purple text-white shadow-glow-sm'
                        : 'bg-solo-purple/10 text-solo-light hover:bg-solo-purple/20'
                    }`}
                  >
                    <category.icon className="mr-2" size={14} />
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workout type selection */}
                <div>
                  <label className="block text-solo-light/80 text-sm mb-1">Workout Type</label>
                  <select
                    value={newWorkout.type}
                    onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                    className="w-full bg-solo-dark/60 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                  >
                    {WORKOUT_TYPES.filter(w => w.category === selectedCategory).map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name} ({workout.unit})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Amount input */}
                <div>
                  <label className="block text-solo-light/80 text-sm mb-1">
                    Amount ({getWorkoutUnit(newWorkout.type)})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newWorkout.amount}
                    onChange={(e) => setNewWorkout({ ...newWorkout, amount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-solo-dark/60 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setIsAddingWorkout(false)}
                  className="px-4 py-2 rounded-lg bg-solo-dark/60 text-solo-light hover:bg-solo-dark/80 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWorkout}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-solo-accent to-solo-purple text-white shadow-glow-sm hover:shadow-glow transition-all duration-200"
                >
                  Add Workout
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="mb-6">
              <button
                onClick={() => setIsAddingWorkout(true)}
                className="w-full py-3 rounded-lg border border-dashed border-solo-purple/30 bg-solo-purple/5 hover:bg-solo-purple/10 text-solo-light flex items-center justify-center transition-colors duration-200"
              >
                <FaPlus className="mr-2" size={14} />
                Add Workout Goal
              </button>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveGoals}
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg bg-gradient-to-r from-solo-accent to-solo-purple text-white shadow-glow-sm hover:shadow-glow transition-all duration-200 flex items-center ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FaSave className="mr-2" size={16} />
              {isSaving ? 'Saving...' : 'Save Goals'}
            </button>
          </div>

          {/* Save message */}
          {saveMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg ${
                saveMessage.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {saveMessage.text}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
} 