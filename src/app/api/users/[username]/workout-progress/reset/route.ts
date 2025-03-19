import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WorkoutProgress from '@/models/WorkoutProgress';
import mongoose from 'mongoose';

// PUT /api/users/[username]/workout-progress/reset
export async function PUT(
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
    const { date } = await request.json();
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    // Reset all workout progress for the specified date
    const result = await WorkoutProgress.updateMany(
      { 
        userId: user._id,
        date
      },
      {
        $set: {
          completed: 0,
          isCompleted: false,
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({ 
      message: 'Workout progress reset successfully',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error resetting workout progress:', error);
    return NextResponse.json({ error: 'Failed to reset workout progress' }, { status: 500 });
  }
} 