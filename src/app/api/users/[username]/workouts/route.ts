import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET /api/users/[username]/workouts
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();
    const { username } = params;
    
    // Get user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return the user's workouts
    return NextResponse.json({ 
      workouts: user.recentWorkouts || [] 
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// POST /api/users/[username]/workouts
export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();
    const { username } = params;
    
    // Get user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const { date, name, duration, xpGained } = await request.json();
    
    if (!date || !name || !duration) {
      return NextResponse.json({ error: 'Date, name, and duration are required' }, { status: 400 });
    }
    
    // Create new workout
    const newWorkout = {
      date,
      name,
      duration,
      xpGained: xpGained || Math.floor(duration / 5) + 5 // Default XP calculation if not provided
    };
    
    // Add the workout to the user's recent workouts
    // Keep only the 10 most recent workouts
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          recentWorkouts: {
            $each: [newWorkout],
            $sort: { date: -1 },
            $slice: 10
          }
        },
        $inc: {
          'progression.xp': newWorkout.xpGained
        }
      },
      { new: true }
    );
    
    // Check if user leveled up
    const oldLevel = user.progression.level;
    const newXP = user.progression.xp + newWorkout.xpGained;
    const xpForNextLevel = oldLevel * 100;
    
    if (newXP >= xpForNextLevel) {
      // Level up the user
      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            'progression.level': 1
          }
        }
      );
    }
    
    return NextResponse.json({ 
      message: 'Workout recorded successfully',
      workout: newWorkout
    });
  } catch (error) {
    console.error('Error recording workout:', error);
    return NextResponse.json({ error: 'Failed to record workout' }, { status: 500 });
  }
} 