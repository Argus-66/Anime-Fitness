'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaDumbbell, FaFire, FaTrophy, FaChartLine, FaUserFriends, FaSignOutAlt, FaEdit, FaUserPlus, FaUserMinus, FaQuoteLeft, FaScroll, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getUser, clearUser } from '@/lib/auth';
import type { User } from '@/types/user';
import UserHeader from '@/components/profile/UserHeader';
import AddFriends from '@/components/profile/AddFriends';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import DailyWorkoutGoals from '@/components/profile/DailyWorkoutGoals';

// Motivational quotes
const quotes = [
  "Every workout is a step toward your legendary status.",
  "The only bad workout is the one that didn't happen.",
  "Your body can withstand almost anything. It's your mind you have to convince.",
  "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
  "The pain you feel today will be the strength you feel tomorrow."
];

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
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ username: string; level: number }>>([]);
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [workouts, setWorkouts] = useState<Array<{
    date: string;
    name: string;
    duration: number;
    xpGained: number;
  }>>([]);
  const [quote, setQuote] = useState('');
  
  // Get the logged-in user
  const loggedInUser = getUser();
  
  // Check if viewing own profile
  const isOwnProfile = loggedInUser?.username === params.username;

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'bio' ? value : Number(value)
    }));
  };

  const handleSaveDetails = async () => {
    try {
      const response = await fetch(`/api/users/${user?.username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      // Refresh user data
      fetchUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!loggedInUser) {
      console.error('User not logged in');
      return;
    }

    try {
      console.log(`Adding friend: ${params.username}`);
      setIsAddingFriend(true);
      
      const response = await fetch(`/api/users/${loggedInUser.username}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendUsername: params.username }),
      });

      if (!response.ok) {
        throw new Error('Failed to add friend');
      }

      setIsFriend(true);
      console.log('Friend added successfully');
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!loggedInUser) {
      console.error('User not logged in');
      return;
    }

    try {
      console.log(`Removing friend: ${params.username}`);
      setIsAddingFriend(true);
      
      const response = await fetch(`/api/users/${loggedInUser.username}/friends/${params.username}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      setIsFriend(false);
      console.log('Friend removed successfully');
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriendDirect = async (username: string) => {
    if (!loggedInUser) {
      console.error('User not logged in');
      return;
    }

    try {
      console.log(`Removing friend: ${username}`);
      
      const response = await fetch(`/api/users/${loggedInUser.username}/friends/${username}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      // Refresh user data to update friends list
      fetchUser();
      console.log('Friend removed successfully');
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${params.username}/workouts`);
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      const data = await response.json();
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      setWorkouts([]);
    }
  }, [params.username]);

  const calculateXpProgress = (level: number, xp: number) => {
    const xpForNextLevel = level * 100;
    return Math.min(100, (xp / xpForNextLevel) * 100);
  };

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${params.username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      setUser(data);
      
      // Check if this user is already a friend of the logged-in user
      if (!isOwnProfile && loggedInUser) {
        const friendsResponse = await fetch(`/api/users/${loggedInUser.username}/friends`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          const isFriendAlready = friendsData.friends.some(
            (friend: { username: string }) => friend.username === params.username
          );
          setIsFriend(isFriendAlready);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, [params.username]);

  useEffect(() => {
    fetchUser();
    // Set a random motivational quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [params.username]);

  useEffect(() => {
    if (user) {
      setEditForm({
        bio: user.bio || '',
        height: user.height || 0,
        weight: user.weight || 0,
        age: user.age || 0
      });
      
      // Fetch workouts when user data is available
      fetchWorkouts();
    }
  }, [user]);

  // Fetch user data when username changes
  useEffect(() => {
    fetchUser();
    // Reset form when username changes
    setIsEditing(false);
  }, [params.username, fetchUser]);

  // Fetch workouts when username changes
  useEffect(() => {
    fetchWorkouts();
  }, [params.username, fetchWorkouts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-solo-dark via-[#1a1025] to-[#0d0a12] flex items-center justify-center">
        <div className="animate-pulse text-solo-light text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-solo-dark via-[#1a1025] to-[#0d0a12] p-8">
      <div className="space-y-8">
        <UserHeader 
          user={user}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onLogout={isOwnProfile ? handleLogout : undefined}
          isOwnProfile={isOwnProfile}
        />

        {/* Friends Section - Moved up */}
        <div className="flex space-x-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowFriendsModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 hover:bg-solo-purple/20 shadow-glow-sm transition-all duration-300"
          >
            <FaUserFriends className="w-5 h-5 text-solo-light" />
            <span className="text-white">Friends ({user.friends?.length || 0})</span>
          </motion.button>
          
          {isOwnProfile ? (
            // If viewing own profile, show "Add Friend" button that opens search modal
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowAddFriendModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-solo-accent/30 to-solo-purple/30 backdrop-blur-lg rounded-xl border border-solo-accent/40 hover:from-solo-accent/40 hover:to-solo-purple/40 shadow-glow-sm transition-all duration-300"
            >
              <FaUserPlus className="w-5 h-5 text-white" />
              <span className="text-white">Add Friend</span>
            </motion.button>
          ) : (
            // If viewing someone else's profile, show direct add/remove friend button
            !isFriend ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleAddFriend}
                disabled={isAddingFriend}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-solo-accent/30 to-solo-purple/30 backdrop-blur-lg rounded-xl border border-solo-accent/40 hover:from-solo-accent/40 hover:to-solo-purple/40 shadow-glow-sm transition-all duration-300 disabled:opacity-50"
              >
                {isAddingFriend ? (
                  <span className="text-white">Adding...</span>
                ) : (
                  <>
                    <FaUserPlus className="w-5 h-5 text-white" />
                    <span className="text-white">Add Friend</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleRemoveFriend}
                disabled={isAddingFriend}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-green-500/30 to-solo-accent/30 backdrop-blur-lg rounded-xl border border-green-500/40 hover:bg-green-500/20 shadow-glow-sm transition-all duration-300 disabled:opacity-50"
              >
                {isAddingFriend ? (
                  <span className="text-white">Updating...</span>
                ) : (
                  <>
                    <FaUserFriends className="w-5 h-5 text-white" />
                    <span className="text-white">Friend ✓</span>
                  </>
                )}
              </motion.button>
            )
          )}
        </div>

        {isOwnProfile && isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-solo-light mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleChange}
                    className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-solo-light mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={editForm.age}
                    onChange={handleChange}
                    className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-solo-light mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={editForm.height}
                    onChange={handleChange}
                    className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-solo-light mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={editForm.weight}
                    onChange={handleChange}
                    className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white focus:border-solo-accent focus:outline-none focus:ring-1 focus:ring-solo-accent/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveDetails}
                className="bg-gradient-to-r from-solo-accent to-solo-purple px-6 py-2 rounded-lg text-white shadow-glow hover:shadow-glow-lg transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Level', value: user?.progression?.level || 1, icon: FaChartLine, color: 'from-green-500' },
            { title: 'Current Streak', value: `${user?.progression?.streak || 0} days`, icon: FaFire, color: 'from-red-500' },
            { title: 'Workouts', value: user?.stats?.workoutsCompleted || 0, icon: FaDumbbell, color: 'from-blue-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-4 shadow-glow-sm hover:shadow-glow transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} to-transparent/20 shadow-glow`}>
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

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-solo-accent" /> Workout Activity
          </h2>
          <ActivityHeatmap workouts={workouts} />
        </motion.div>

        {/* Daily Workout Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
        >
          <DailyWorkoutGoals 
            userId={user._id} 
            username={user.username} 
            isOwnProfile={isOwnProfile} 
          />
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text mb-4 flex items-center">
            <FaChartLine className="mr-2 text-solo-accent" /> Level Progress
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-solo-light">
              <span>Level {user.progression.level}</span>
              <span>{user.progression.xp} XP</span>
            </div>
            <div className="h-2 bg-solo-purple/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-solo-accent to-solo-purple rounded-full shadow-glow"
                style={{ width: `${calculateXpProgress(user.progression.level, user.progression.xp)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quote of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
        >
          <div className="flex items-start space-x-3">
            <FaQuoteLeft className="text-solo-accent text-xl flex-shrink-0" />
            <p className="text-solo-light/80 italic">{quote}</p>
          </div>
        </motion.div>

        {/* Recent Workouts Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-solo-dark/40 backdrop-blur-lg rounded-xl border border-solo-purple/30 p-6 shadow-glow-sm"
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-solo-light to-solo-beige text-transparent bg-clip-text mb-4 flex items-center">
            <FaScroll className="mr-2 text-solo-accent" /> Recent Workouts
          </h2>
          <div className="space-y-4">
            {user.recentWorkouts?.length > 0 ? (
              user.recentWorkouts.map((workout, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-3 bg-solo-purple/10 rounded-lg border border-solo-purple/20 hover:bg-solo-purple/20 transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-solo-accent shadow-glow" />
                  <div>
                    <p className="text-white font-medium">{workout.name}</p>
                    <p className="text-sm text-solo-light/80">
                      {new Date(workout.date).toLocaleDateString()} • {workout.duration} min • +{workout.xpGained} XP
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-solo-light/60 text-center py-4">No recent workouts found</p>
            )}
          </div>
        </motion.div>

        {/* Friends Modal */}
        {showFriendsModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-solo-dark via-[#1a1025] to-[#0d0a12] rounded-xl border border-solo-purple/30 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-glow"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Friends</h3>
                <button 
                  onClick={() => setShowFriendsModal(false)}
                  className="text-solo-light hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {user.friends && user.friends.length > 0 ? (
                <div className="space-y-3">
                  {user.friends.map((friend: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-solo-purple/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{friend.username[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{friend.username}</p>
                          <p className="text-xs text-solo-light">Level {friend.level || 1}</p>
                        </div>
                      </div>
                      
                      {isOwnProfile && (
                        <button
                          onClick={() => handleRemoveFriendDirect(friend.username)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                        >
                          <FaUserMinus />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-solo-light text-center py-6">No friends yet</p>
              )}
            </motion.div>
          </div>
        )}
        
        {isOwnProfile && showAddFriendModal && (
          <AddFriends 
            onClose={() => setShowAddFriendModal(false)} 
            onFriendAdded={fetchUser}
          />
        )}
      </div>
    </div>
  );
} 