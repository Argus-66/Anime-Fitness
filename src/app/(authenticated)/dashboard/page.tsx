'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import type { User } from '@/types/user';
import { motion } from 'framer-motion';
import { FaFire, FaChartLine, FaCrown, FaDumbbell, FaScroll, FaDragon, FaQuoteLeft } from 'react-icons/fa';
import DailyWorkoutTracker from '@/components/dashboard/DailyWorkoutTracker';

// Temporary quotes array - will be replaced with AI integration
const quotes = [
  "Every rep brings you closer to your legendary status.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The only bad workout is the one that didn't happen."
];

// Particle configuration
const PARTICLE_COUNT = 50;
const PARTICLE_COLORS = [
  'bg-solo-purple/30',
  'bg-solo-accent/30',
  'bg-solo-light/20',
  'bg-purple-400/20',
];

const PARTICLE_SIZES = ['w-1 h-1', 'w-2 h-2', 'w-3 h-3'];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [quote, setQuote] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [router]);

  const generateRandomPath = () => {
    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() * 400 - 200); // Random drift left or right
    return [startX, endX];
  };

  // Handle completed workout
  const handleWorkoutComplete = async (date: string, workoutName: string, duration: number) => {
    if (!user) return;
    
    try {
      // Add the workout to the user's recent workouts
      const response = await fetch(`/api/users/${user.username}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          name: workoutName,
          duration,
          xpGained: Math.floor(duration / 5) + 5 // Simple XP calculation
        }),
      });
      
      if (response.ok) {
        // Refresh user data to update stats
        const updatedUser = getUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error recording workout:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-solo-dark via-[#1a1025] to-[#0d0a12] p-8 relative overflow-hidden">
      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(PARTICLE_COUNT)].map((_, i) => {
          const size = PARTICLE_SIZES[Math.floor(Math.random() * PARTICLE_SIZES.length)];
          const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
          const duration = Math.random() * 10 + 10; // 10-20 seconds
          const delay = Math.random() * -20;
          const [startX, endX] = generateRandomPath();
          
          return (
            <motion.div
              key={i}
              className={`absolute ${size} ${color} rounded-full 
                shadow-[0_0_10px_rgba(82,43,91,0.5)] backdrop-blur-sm`}
              animate={{
                y: [-20, window.innerHeight + 20],
                x: [startX, endX],
                opacity: [0, 0.8, 0],
                scale: [1, Math.random() * 1.5 + 0.5, 1],
                rotate: [0, Math.random() * 360]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay,
                times: [0, 0.8, 1]
              }}
              style={{
                filter: 'blur(1px)'
              }}
            />
          );
        })}
      </div>

      {/* Additional ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-solo-purple/10 rounded-full filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-solo-accent/10 rounded-full filter blur-[100px] animate-pulse" />

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text mb-8"
      >
        Welcome back, {user.username}!
      </motion.h1>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Current Streak', value: `${user.progression.streak} days`, icon: FaFire, color: 'from-red-500' },
          { title: 'Total XP', value: user.progression.xp, icon: FaChartLine, color: 'from-green-500' },
          { title: 'Level', value: user.progression.level, icon: FaCrown, color: 'from-yellow-500' },
          { title: 'Workouts', value: user.stats?.workoutsCompleted || 0, icon: FaDumbbell, color: 'from-blue-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-4
              shadow-[0_0_20px_rgba(82,43,91,0.1)] hover:shadow-[0_0_30px_rgba(82,43,91,0.2)]
              transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} to-transparent/20`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-solo-light/70 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Workout Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <DailyWorkoutTracker 
          username={user.username} 
          userId={user._id} 
          onWorkoutComplete={handleWorkoutComplete}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20 
            shadow-[0_0_20px_rgba(82,43,91,0.2)] hover:shadow-[0_0_30px_rgba(82,43,91,0.3)]"
        >
          <h2 className="text-2xl font-semibold text-solo-light mb-6 flex items-center">
            <FaChartLine className="mr-2" /> Your Progress
          </h2>
          <div className="space-y-4">
            {Object.entries(user.progression).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-solo-light/80 capitalize">{key}</span>
                <span className="text-white font-bold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily/Weekly Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20"
        >
          <h2 className="text-2xl font-semibold text-solo-light mb-6 flex items-center">
            <FaScroll className="mr-2" /> Daily Quests
          </h2>
          <div className="space-y-4">
            <div className="p-3 bg-solo-purple/10 rounded-lg border border-solo-purple/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-solo-light">Complete 50 push-ups</span>
                <span className="text-solo-accent">0/50</span>
              </div>
              <div className="h-1 bg-solo-purple/20 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-solo-accent rounded-full" />
              </div>
            </div>
            {/* Add more daily quests here */}
          </div>
        </motion.div>

        {/* Current Event & Quote */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Current Event */}
          <div className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20">
            <h2 className="text-2xl font-semibold text-solo-light mb-4 flex items-center">
              <FaDragon className="mr-2" /> Current Quest
            </h2>
            <div className="text-solo-light/80">
              <p className="font-semibold text-solo-accent mb-2">Dungeon: The Iron Temple</p>
              <p>Clear 3 workout sessions to defeat the boss</p>
            </div>
          </div>

          {/* Quote of the Day */}
          <div className="bg-solo-dark/30 backdrop-blur-lg p-6 rounded-xl border border-solo-purple/20">
            <div className="flex items-start space-x-3">
              <FaQuoteLeft className="text-solo-accent text-xl flex-shrink-0" />
              <p className="text-solo-light/80 italic">{quote}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 