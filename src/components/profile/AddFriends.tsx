import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { getUser } from '@/lib/auth';

interface AddFriendsProps {
  onClose: () => void;
  onFriendAdded?: () => void; // Callback to refresh friends list
}

const AddFriends: React.FC<AddFriendsProps> = ({ onClose, onFriendAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ username: string; level: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const currentUser = getUser();

  // Debounce search input
  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        setSearchTerm(value);
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    },
    [] // No dependencies needed for the inline function
  );

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    setIsLoading(true);
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Searching for:', term);
      const response = await fetch(`/api/users/search?username=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Search API error:', errorData);
        throw new Error(errorData.error || 'Failed to search users');
      }
      
      const data = await response.json();
      console.log('Search API response:', data);
      
      // Check if the response is an array
      if (!Array.isArray(data)) {
        console.error('Expected array response, got:', data);
        setSearchResults([]);
        setError('Invalid response format from server');
        setIsLoading(false);
        return;
      }
      
      // Filter out the current user from results
      const filteredResults = data.filter(user => 
        user && user.username && user.username !== currentUser?.username
      );
      
      console.log('Filtered results:', filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (username: string) => {
    try {
      setError(null);
      
      if (!currentUser?.username) {
        setError('You must be logged in to add friends');
        return;
      }
      
      console.log('Adding friend:', username, 'for user:', currentUser.username);
      
      const response = await fetch(`/api/users/${currentUser.username}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername: username })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to add friend:', data);
        throw new Error(data.error || 'Failed to add friend');
      }

      console.log('Friend added successfully:', data);
      
      // Mark this user as added
      setAddedFriends(prev => new Set(prev).add(username));
      
      // Show success message
      setError(`Successfully added ${username} as a friend!`);
      
      // Call the callback to refresh the friends list
      if (onFriendAdded) {
        onFriendAdded();
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      setError((error as Error).message || 'Failed to add friend. Please try again.');
    }
  };

  // Add a function to test the database connection
  const testDatabase = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch('/api/test-db');
      
      if (!response.ok) {
        throw new Error(`Database test failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Database test results:', data);
      
      if (data.userCount > 0) {
        setError(`Database connected. Found ${data.userCount} users. Users: ${data.users.map((u: {username: string}) => u.username).join(', ')}. Argus exists: ${data.argusFound ? 'Yes' : 'No'}`);
      } else {
        setError('Database connected but no users found. Please add users to the database first.');
      }
    } catch (error) {
      console.error('Database test error:', error);
      setError(`Failed to test database connection: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to create a test user
  const createTestUser = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch('/api/test-db/add-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create test user: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Test user created:', data);
      
      setError(`Test user created: ${data.user.username} (Level ${data.user.level})`);
      
      // Refresh the search results if there's a search term
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      setError(`Failed to create test user: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        className="bg-solo-dark rounded-xl border border-solo-purple/20 p-6 m-4 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Add Friends</h2>
          <button onClick={onClose} className="text-solo-light hover:text-white">✕</button>
        </div>
        
        <div className="relative mb-6">
          <div className="flex items-center bg-solo-purple/20 border border-solo-purple/30 rounded-lg overflow-hidden">
            <FaSearch className="ml-3 text-solo-light" />
            <input
              type="text"
              placeholder="Search by username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-white focus:outline-none"
              autoFocus
            />
            {isLoading && <FaSpinner className="animate-spin mr-3 text-solo-light" />}
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          
          {/* Debug buttons */}
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={testDatabase}
              className="text-xs text-solo-light hover:text-white"
            >
              Test Database
            </button>
            <button 
              onClick={createTestUser}
              className="text-xs text-solo-light hover:text-white"
            >
              Create Test User
            </button>
          </div>
        </div>
        
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div 
                  key={user.username} 
                  className="flex justify-between items-center p-3 bg-solo-purple/20 rounded-lg hover:bg-solo-purple/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-white">{user.username}</span>
                      <p className="text-xs text-solo-light">Level {user.level}</p>
                    </div>
                  </div>
                  
                  {addedFriends.has(user.username) ? (
                    <span className="text-green-400 text-sm">Added</span>
                  ) : (
                    <button 
                      onClick={() => handleAddFriend(user.username)} 
                      className="bg-solo-accent hover:bg-solo-accent/80 text-white p-2 rounded-lg transition-colors"
                    >
                      <FaUserPlus />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              {searchTerm.trim() ? (
                isLoading ? (
                  <p className="text-solo-light">Searching...</p>
                ) : (
                  <p className="text-solo-light">No users found. Try a different search term.</p>
                )
              ) : (
                <p className="text-solo-light">Start typing to search for users</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddFriends; 