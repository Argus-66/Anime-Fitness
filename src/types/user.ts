export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  joinedDate: Date;
  lastLogin: Date;
  theme: string;
  coins: number;
  progression: {
    level: number;
    xp: number;
    streak: number;
  };
  skills: {
    strength: number;
    agility: number;
    endurance: number;
  };
  workouts: string[];
  badges: string[];
  friends: string[];
  cardsOwned: string[];
}
