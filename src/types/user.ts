export interface User {
  _id: string;  // Changed from id to _id to match MongoDB
  username: string;
  email: string;
  bio: string;
  createdAt: string;
  // Add the direct properties that are in your database
  height: number;
  weight: number;
  age: number;
  gender: string;
  joinedDate: string;
  lastLogin: string;
  theme: string;
  coins: number;
  progression: {
    level: number;
    xp: number;
    streak: number;
  };
  stats: {
    workoutsCompleted: number;
    bestStreak: number;
  };
  skills: {
    strength: number;
    agility: number;
    endurance: number;
  };
  friends: Array<{
    username: string;
    level: number;
  }>;
  recentWorkouts: Array<{
    date: string;
    name: string;
    duration: number;
    xpGained: number;
  }>;
  achievements?: Array<{  // Made optional with ?
    title: string;
    description: string;
    dateEarned: string;
  }>;
  activityFeed?: Array<{
    date: string;
    description: string;
  }>;
  workouts: any[]; // Define proper workout type later
  badges: any[];  // Added this from your console output
  cardsOwned: any[];  // Added this from your console output
  __v: number;  // Added this from your console output
}