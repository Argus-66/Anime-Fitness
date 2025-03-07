import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    console.log('MongoDB connection state:', db.connection.readyState);

    const body = await req.json();
    console.log('Received registration data:', body);

    const { username, email, password, age, gender, height, weight } = body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with initial stats
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      age,
      gender,
      height,
      weight,
      joinedDate: new Date(),
      lastLogin: new Date(),
      theme: 'solo-leveling',
      coins: 0,
      progression: {
        level: 1,
        xp: 0,
        streak: 0
      },
      skills: {
        strength: 1,
        agility: 1,
        endurance: 1
      },
      workouts: [],
      badges: [],
      friends: [],
      cardsOwned: []
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: 'Registration successful', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 