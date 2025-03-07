'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaDumbbell, FaFire, FaTrophy, FaChartLine, FaUserFriends, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getUser, clearUser } from '@/lib/auth';
import type { User } from '@/types/user';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    height: 0,
    weight: 0,
    age: 0
  });
  const [friendUsername, setFriendUsername] = useState('');

  // Calculate XP progress to next level
  const calculateXpProgress = (level: number, currentXp: number) => {
    const currentLevelXp = 1000 * Math.pow(level, 1.5);
    const nextLevelXp = 1000 * Math.pow(level + 1, 1.5);
    const progress = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  const handleAddFriend = async () => {
    // Add friend logic here
  };

  const handleSaveDetails = async () => {
    // Save user details logic here
    setIsEditing(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.username}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, [params.username]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header with Edit/Logout */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
            <span className="text-4xl font-bold text-white">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user.username}</h1>
            <p className="text-solo-light">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            {!isEditing && <p className="text-solo-light mt-2">{user.bio || 'No bio yet'}</p>}
          </div>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setIsEditing(!isEditing)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-solo-purple/20 text-solo-light hover:bg-solo-purple/30">
            <FaEdit /> <span>Edit Profile</span>
          </button>
          <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-6"
        >
          {/* Add form fields for bio, height, weight, age */}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Level', value: user.progression.level, icon: FaChartLine, color: 'from-green-500' },
          { title: 'XP', value: user.progression.xp, icon: FaTrophy, color: 'from-yellow-500' },
          { title: 'Current Streak', value: `${user.progression.streak} days`, icon: FaFire, color: 'from-red-500' },
          { title: 'Workouts', value: user.stats.workoutsCompleted, icon: FaDumbbell, color: 'from-blue-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-4"
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

      {/* XP Progress */}
      <div className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Level Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-solo-light">
            <span>Level {user.progression.level}</span>
            <span>{user.progression.xp} XP</span>
          </div>
          <div className="h-2 bg-solo-purple/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-solo-accent to-solo-purple rounded-full"
              style={{ width: `${calculateXpProgress(user.progression.level, user.progression.xp)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Workouts Timeline */}
      <div className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>
        <div className="space-y-4">
          {user.recentWorkouts?.map((workout, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-solo-accent" />
              <div>
                <p className="text-white">{workout.name}</p>
                <p className="text-sm text-solo-light">
                  {new Date(workout.date).toLocaleDateString()} • {workout.duration} min • +{workout.xpGained} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends List */}
      <div className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Friends</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              placeholder="Add friend by username"
              className="bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-1 text-white"
            />
            <button
              onClick={handleAddFriend}
              className="bg-solo-accent px-3 py-1 rounded-lg text-white"
            >
              Add
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.friends?.map((friend) => (
            <div key={friend.username} className="flex items-center space-x-3 p-3 bg-solo-purple/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
                <span className="text-lg font-bold text-white">{friend.username[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white">{friend.username}</p>
                <p className="text-sm text-solo-light">Level {friend.level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 