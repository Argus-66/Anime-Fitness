import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'TestUser' });
    
    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        user: {
          username: existingUser.username,
          email: existingUser.email,
          level: existingUser.progression?.level || 1
        }
      });
    }

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      password: hashedPassword,
      bio: 'This is a test user',
      height: 175,
      weight: 70,
      age: 25,
      gender: 'male',
      progression: {
        level: 5,
        xp: 500,
        streak: 3
      },
      stats: {
        workoutsCompleted: 10,
        bestStreak: 5
      },
      joinedDate: new Date(),
      lastLogin: new Date(),
      theme: 'solo-leveling',
      coins: 100
    });

    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        username: testUser.username,
        email: testUser.email,
        level: testUser.progression.level
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ 
      error: 'Failed to create test user', 
      details: (error as Error).message 
    }, { status: 500 });
  }
} 