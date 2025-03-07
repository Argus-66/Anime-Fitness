import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // TODO: Replace with database query
    const mockUser = {
      id: '1',
      username: params.username,
      email: 'user@example.com',
      createdAt: new Date().toISOString(),
      progression: {
        level: 1,
        xp: 0,
        streak: 0,
      },
      stats: {
        workoutsCompleted: 0,
        bestStreak: 0,
      },
      skills: {
        strength: 1,
        agility: 1,
        endurance: 1,
      },
      achievements: [
        {
          title: 'First Login',
          description: 'Started your fitness journey',
          dateEarned: new Date().toISOString(),
        },
      ],
      activityFeed: [
        {
          date: new Date().toISOString(),
          description: 'Joined Fitness Quest',
        },
      ],
      workouts: [],
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 