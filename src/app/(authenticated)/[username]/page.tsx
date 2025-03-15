'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaDumbbell, FaFire, FaTrophy, FaChartLine, FaUserFriends, FaSignOutAlt, FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getUser, clearUser } from '@/lib/auth';
import type { User } from '@/types/user';
import UserHeader from '@/components/profile/UserHeader';
import AddFriends from '@/components/profile/AddFriends';

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
  
  // Get the logged-in user
  const loggedInUser = getUser();
  
  // Check if viewing own profile
  const isOwnProfile = loggedInUser?.username === params.username;

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
    if (!user || !loggedInUser) return;
    
    try {
      setIsAddingFriend(true);
      
      const response = await fetch(`/api/users/${loggedInUser.username}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername: user.username })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add friend');
      }
      
      // Update the isFriend state
      setIsFriend(true);
      
      // Optionally show a success message
      alert(`Successfully added ${user.username} as a friend!`);
    } catch (error) {
      console.error('Failed to add friend:', error);
      alert((error as Error).message || 'Failed to add friend. Please try again.');
    } finally {
      setIsAddingFriend(false);
    }
  };
  
  const handleRemoveFriendDirect = async () => {
    if (!user || !loggedInUser) return;
    
    try {
      setIsAddingFriend(true);
      
      const response = await fetch(`/api/users/${loggedInUser.username}/friends/${user.username}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove friend');
      }
      
      // Update the isFriend state
      setIsFriend(false);
      
      // Optionally show a success message
      alert(`Removed ${user.username} from your friends list.`);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert((error as Error).message || 'Failed to remove friend. Please try again.');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveDetails = async () => {
    try {
      const response = await fetch(`/api/users/${user?.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editForm.bio,
          age: editForm.age,
          height: editForm.height,
          weight: editForm.weight
        })
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedUser = await response.json();
      console.log('Received updated user:', updatedUser); // Add this to debug
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save details:', error);
    }
  };

  const handleSearchUser = async () => {
    try {
      const response = await fetch(`/api/users/search?username=${searchUsername}`);
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleRemoveFriend = async (friendUsername: string) => {
    try {
      console.log('Removing friend:', friendUsername);
      
      const response = await fetch(`/api/users/${user?.username}/friends/${friendUsername}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove friend');
      }
      
      console.log('Friend removed successfully');
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        friends: prev.friends.filter(f => f.username !== friendUsername)
      } : null);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  };

  const fetchUser = async () => {
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
  };

  useEffect(() => {
    fetchUser();
  }, [params.username]);

  useEffect(() => {
    if (user) {
      setEditForm({
        bio: user.bio || '',
        height: user.height || 0,
        weight: user.weight || 0,
        age: user.age || 0
      });
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <UserHeader 
        user={user}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onLogout={isOwnProfile ? handleLogout : undefined}
        isOwnProfile={isOwnProfile}
      />

      {/* Friends Section - Moved up */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowFriendsModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 hover:bg-solo-purple/10"
        >
          <FaUserFriends className="w-5 h-5" />
          <span className="text-white">Friends ({user.friends?.length || 0})</span>
        </button>
        
        {isOwnProfile ? (
          // If viewing own profile, show "Add Friend" button that opens search modal
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-solo-accent/20 rounded-xl border border-solo-accent/30 hover:bg-solo-accent/30"
          >
            <FaUserPlus className="w-5 h-5" />
            <span className="text-white">Add Friend</span>
          </button>
        ) : (
          // If viewing someone else's profile, show "Add Friend" or "Remove Friend" button
          isFriend ? (
            <button
              onClick={handleRemoveFriendDirect}
              disabled={isAddingFriend}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 rounded-xl border border-green-500/30 hover:bg-green-500/30"
            >
              <FaUserFriends className="w-5 h-5" />
              <span className="text-white">
                {isAddingFriend ? 'Processing...' : 'Friend ✓'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleAddFriend}
              disabled={isAddingFriend}
              className="flex items-center space-x-2 px-6 py-3 bg-solo-accent/20 rounded-xl border border-solo-accent/30 hover:bg-solo-accent/30"
            >
              <FaUserPlus className="w-5 h-5" />
              <span className="text-white">
                {isAddingFriend ? 'Adding...' : 'Add Friend'}
              </span>
            </button>
          )
        )}
      </div>

      {/* Edit Form - Only show if viewing own profile */}
      {isOwnProfile && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-solo-dark/30 backdrop-blur-lg rounded-xl border border-solo-purple/20 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-solo-light mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-solo-light mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={editForm.weight}
                  onChange={handleChange}
                  className="w-full bg-solo-purple/20 border border-solo-purple/30 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveDetails}
              className="bg-solo-accent px-6 py-2 rounded-lg text-white"
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

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-solo-dark rounded-xl border border-solo-purple/20 p-6 m-4 max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Friends</h2>
              <button onClick={() => setShowFriendsModal(false)} className="text-solo-light hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              {user.friends?.map((friend) => (
                <div key={friend.username} className="flex items-center justify-between p-4 bg-solo-purple/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{friend.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white">{friend.username}</p>
                      <p className="text-sm text-solo-light">Level {friend.level}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFriend(friend.username)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaUserMinus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Friends Modal - Only for own profile */}
      {isOwnProfile && showAddFriendModal && (
        <AddFriends 
          onClose={() => setShowAddFriendModal(false)} 
          onFriendAdded={fetchUser}
        />
      )}
    </div>
  );
} 