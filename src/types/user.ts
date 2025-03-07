export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  createdAt: string;
  details: {
    height: number;
    weight: number;
    age: number;
  };
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
  achievements: Array<{
    title: string;
    description: string;
    dateEarned: string;
  }>;
  activityFeed?: Array<{
    date: string;
    description: string;
  }>;
  workouts: any[]; // Define proper workout type later
}
