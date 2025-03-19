import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaSwimmer, FaBiking, FaCheck, FaUndo, FaTrophy } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiJumpingRope, GiMeditation } from 'react-icons/gi';
import { MdFitnessCenter, MdDirectionsRun } from 'react-icons/md';

interface WorkoutGoal {
  id: string;
  type: string;
  amount: number;
  unit: string;
}

interface WorkoutProgress {
  id: string;
  goalId: string;
  type: string;
  completed: number;
  total: number;
  unit: string;
  isCompleted: boolean;
}

interface DailyWorkoutTrackerProps {
  username: string;
  userId: string;
  onWorkoutComplete: (date: string, workoutName: string, duration: number) => void;
}

// Map of workout types to their respective icons
const WORKOUT_ICONS: Record<string, any> = {
  running: FaRunning,
  cycling: FaBiking,
  swimming: FaSwimmer,
  jump_rope: GiJumpingRope,
  pushups: GiMuscleUp,
  pullups: GiMuscleUp,
  squats: MdFitnessCenter,
  lunges: MdDirectionsRun,
  plank: GiMuscleUp,
  bench_press: GiWeightLiftingUp,
  deadlift: GiWeightLiftingUp,
  shoulder_press: GiWeightLiftingUp,
  bicep_curls: GiWeightLiftingUp,
  tricep_extensions: GiWeightLiftingUp,
  yoga: GiMeditation,
  stretching: GiMeditation,
};

// Map of workout types to their estimated duration in minutes
const WORKOUT_DURATIONS: Record<string, number> = {
  running: 30,
  cycling: 30,
  swimming: 30,
  jump_rope: 15,
  pushups: 10,
  pullups: 10,
  squats: 10,
  lunges: 10,
  plank: 5,
  bench_press: 15,
  deadlift: 15,
  shoulder_press: 15,
  bicep_curls: 10,
  tricep_extensions: 10,
  yoga: 30,
  stretching: 15,
};

export default function DailyWorkoutTracker({ username, userId, onWorkoutComplete }: DailyWorkoutTrackerProps) {
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoal[]>([]);
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch workout goals and progress on component mount
  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch workout goals
        const goalsResponse = await fetch(`/api/users/${username}/workout-goals`);
        if (!goalsResponse.ok) throw new Error('Failed to fetch workout goals');
        const goalsData = await goalsResponse.json();
        
        // Fetch today's workout progress
        const progressResponse = await fetch(`/api/users/${username}/workout-progress`);
        let progressData = { workoutProgress: [] };
        
        if (progressResponse.ok) {
          progressData = await progressResponse.json();
        }
        
        // Initialize progress for each goal if not already tracked
        const currentDate = new Date().toISOString().split('T')[0];
        const todaysProgress = progressData.workoutProgress.filter(
          (progress: any) => progress.date === currentDate
        );
        
        // Check if all workouts are completed for today
        const allWorkoutsCompleted = todaysProgress.length > 0 && 
          todaysProgress.every((progress: any) => progress.isCompleted);
        
        setTodayCompleted(allWorkoutsCompleted);
        
        // If we have goals but no progress for today, initialize them
        if (goalsData.workoutGoals.length > 0 && todaysProgress.length === 0 && !allWorkoutsCompleted) {
          const initialProgress = goalsData.workoutGoals.map((goal: WorkoutGoal) => ({
            id: `progress_${goal.id}_${currentDate}`,
            goalId: goal.id,
            type: goal.type,
            completed: 0,
            total: goal.amount,
            unit: goal.unit,
            isCompleted: false,
            date: currentDate
          }));
          
          setWorkoutProgress(initialProgress);
          
          // Save initial progress to the database
          await fetch(`/api/users/${username}/workout-progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workoutProgress: initialProgress }),
          });
        } else {
          setWorkoutProgress(todaysProgress);
        }
        
        setWorkoutGoals(goalsData.workoutGoals);
        setAllCompleted(allWorkoutsCompleted);
      } catch (error) {
        console.error('Error fetching workout data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkoutData();
  }, [username]);

  // Update progress for a specific workout
  const updateProgress = async (progressId: string, newValue: number, goalId: string, workoutType: string, total: number) => {
    // Don't update if all workouts are already completed for today
    if (todayCompleted) return;
    
    // Ensure the new value doesn't exceed the total
    const clampedValue = Math.min(newValue, total);
    const isCompleted = clampedValue >= total;
    
    // Update local state
    const updatedProgress = workoutProgress.map(progress => {
      if (progress.id === progressId) {
        return {
          ...progress,
          completed: clampedValue,
          isCompleted
        };
      }
      return progress;
    });
    
    setWorkoutProgress(updatedProgress);
    
    // Check if all workouts are now completed
    const allCompleted = updatedProgress.every(progress => progress.isCompleted);
    
    if (allCompleted && !todayCompleted) {
      setAllCompleted(true);
      setTodayCompleted(true);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
    
    // Save progress to the database
    try {
      await fetch(`/api/users/${username}/workout-progress/${progressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: clampedValue,
          isCompleted
        }),
      });
      
      // If this workout was just completed, record it
      if (isCompleted && !workoutProgress.find(p => p.id === progressId)?.isCompleted) {
        const workoutGoal = workoutGoals.find(goal => goal.id === goalId);
        if (workoutGoal) {
          const workoutName = workoutGoal.type.replace(/_/g, ' ');
          const duration = WORKOUT_DURATIONS[workoutGoal.type] || 15; // Default to 15 minutes if not specified
          
          // Call the callback to record the completed workout
          onWorkoutComplete(new Date().toISOString(), workoutName, duration);
        }
      }
    } catch (error) {
      console.error('Error updating workout progress:', error);
    }
  };

  // Mark a workout as complete
  const markAsComplete = (progressId: string, goalId: string, workoutType: string, total: number) => {
    updateProgress(progressId, total, goalId, workoutType, total);
  };

  // Reset progress for a workout
  const resetProgress = async (progressId: string) => {
    // Don't reset if all workouts are already completed for today
    if (todayCompleted) return;
    
    // Update local state
    const updatedProgress = workoutProgress.map(progress => {
      if (progress.id === progressId) {
        return {
          ...progress,
          completed: 0,
          isCompleted: false
        };
      }
      return progress;
    });
    
    setWorkoutProgress(updatedProgress);
    
    // Save progress to the database
    try {
      await fetch(`/api/users/${username}/workout-progress/${progressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: 0,
          isCompleted: false
        }),
      });
    } catch (error) {
      console.error('Error resetting workout progress:', error);
    }
  };

  // Reset all progress for today
  const resetAllProgress = async () => {
    if (todayCompleted) return;
    
    // Update local state
    const updatedProgress = workoutProgress.map(progress => ({
      ...progress,
      completed: 0,
      isCompleted: false
    }));
    
    setWorkoutProgress(updatedProgress);
    
    // Save progress to the database
    try {
      await fetch(`/api/users/${username}/workout-progress/reset`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        }),
      });
    } catch (error) {
      console.error('Error resetting all workout progress:', error);
    }
  };

  // Get the name of a workout type
  const getWorkoutName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get the icon for a workout type
  const getWorkoutIcon = (type: string) => {
    return WORKOUT_ICONS[type] || FaDumbbell;
  };

  if (isLoading) {
    return (
      <div className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20 animate-pulse">
        <div className="h-8 w-48 bg-solo-purple/20 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-solo-purple/10 rounded-lg"></div>
          <div className="h-16 bg-solo-purple/10 rounded-lg"></div>
          <div className="h-16 bg-solo-purple/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20 relative overflow-hidden">
      {/* Confetti effect when all workouts are completed */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(100)].map((_, i) => {
            const size = Math.random() * 10 + 5;
            const color = [
              'bg-red-500',
              'bg-blue-500',
              'bg-green-500',
              'bg-yellow-500',
              'bg-purple-500',
              'bg-pink-500',
              'bg-solo-accent',
              'bg-solo-purple',
            ][Math.floor(Math.random() * 8)];
            
            return (
              <motion.div
                key={i}
                className={`absolute ${color} rounded-full`}
                initial={{
                  x: Math.random() * 100 + 50,
                  y: -20,
                  scale: 0
                }}
                animate={{
                  x: Math.random() * 400 - 100,
                  y: Math.random() * 500 + 100,
                  scale: 1,
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
                style={{
                  width: `${size}px`,
                  height: `${size}px`
                }}
              />
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-solo-light flex items-center">
          <FaDumbbell className="mr-2" /> Daily Workouts
        </h2>
        
        {allCompleted ? (
          <div className="flex items-center text-green-400">
            <FaCheck className="mr-1" />
            <span>All Complete!</span>
          </div>
        ) : (
          <button
            onClick={resetAllProgress}
            className="text-solo-light/70 hover:text-solo-light text-sm flex items-center"
            disabled={workoutProgress.every(p => p.completed === 0)}
          >
            <FaUndo className="mr-1" size={12} />
            Reset All
          </button>
        )}
      </div>

      {workoutGoals.length === 0 ? (
        <div className="text-center py-8 bg-solo-purple/5 rounded-lg border border-dashed border-solo-purple/20">
          <p className="text-solo-light/60">No daily workout goals set yet.</p>
          <p className="text-solo-light/80 text-sm mt-2">
            Visit your profile to set up your daily workout goals!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutGoals.map((goal) => {
            const progress = workoutProgress.find(p => p.goalId === goal.id);
            if (!progress) return null;
            
            const Icon = getWorkoutIcon(goal.type);
            const progressPercentage = Math.min(100, (progress.completed / goal.amount) * 100);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  progress.isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-solo-purple/10 border-solo-purple/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      progress.isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-green-700'
                        : 'bg-gradient-to-br from-solo-accent to-solo-purple'
                    }`}>
                      <Icon className="text-white" size={16} />
                    </div>
                    <span className="text-solo-light font-medium">{getWorkoutName(goal.type)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm ${
                      progress.isCompleted ? 'text-green-400' : 'text-solo-accent'
                    }`}>
                      {progress.completed}/{goal.amount} {goal.unit}
                    </span>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex-1 mr-2">
                      <div className="h-2 bg-solo-purple/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            progress.isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-green-400'
                              : 'bg-gradient-to-r from-solo-accent to-solo-purple'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {!todayCompleted && (
                      <div className="flex space-x-2">
                        {!progress.isCompleted && (
                          <>
                            <button
                              onClick={() => updateProgress(
                                progress.id,
                                progress.completed + Math.ceil(goal.amount * 0.25),
                                goal.id,
                                goal.type,
                                goal.amount
                              )}
                              className="px-2 py-1 text-xs bg-solo-purple/20 hover:bg-solo-purple/30 rounded text-solo-light"
                            >
                              +25%
                            </button>
                            <button
                              onClick={() => markAsComplete(progress.id, goal.id, goal.type, goal.amount)}
                              className="px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 rounded text-green-400"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {progress.completed > 0 && !progress.isCompleted && (
                          <button
                            onClick={() => resetProgress(progress.id)}
                            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-solo-accent/20 rounded-lg border border-green-500/30 text-center"
        >
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-green-500 to-solo-accent rounded-full p-3 shadow-glow">
              <FaTrophy className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Daily Workouts Completed!</h3>
          <p className="text-solo-light/80">
            Great job! You&apos;ve completed all your workouts for today. Come back tomorrow for a new challenge!
          </p>
        </motion.div>
      )}
    </div>
  );
} 