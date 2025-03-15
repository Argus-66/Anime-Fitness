import { FaEdit, FaSignOutAlt } from 'react-icons/fa';
import type { User } from '@/types/user';

interface UserHeaderProps {
  user: User;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onLogout?: () => void;
  isOwnProfile?: boolean;
}

export default function UserHeader({ 
  user, 
  isEditing, 
  setIsEditing, 
  onLogout,
  isOwnProfile = false
}: UserHeaderProps) {
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solo-accent to-solo-purple flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{user.username[0].toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user.username}</h1>
          <p className="text-solo-light">Member since {formatDate(user.createdAt)}</p>
          <p className="text-solo-light">
            Age: {user.age || 0} • 
            Height: {user.height || 0}cm • 
            Weight: {user.weight || 0}kg
          </p>
          {!isEditing && <p className="text-solo-light mt-2">{user.bio || 'No bio yet'}</p>}
        </div>
      </div>
      
      {isOwnProfile && (
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-solo-purple/20 text-solo-light hover:bg-solo-purple/30"
          >
            <FaEdit /> <span>Edit Profile</span>
          </button>
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}