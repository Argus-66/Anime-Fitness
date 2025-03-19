import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WorkoutProgress from '@/models/WorkoutProgress';
import mongoose from 'mongoose';

// PUT /api/users/[username]/workout-progress/[progressId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { username: string; progressId: string } }
) {
  try {
    await connectDB();
    const { username, progressId } = params;
    
    // Get user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const { completed, isCompleted } = await request.json();
    
    // Find and update the workout progress
    const updatedProgress = await WorkoutProgress.findOneAndUpdate(
      { 
        _id: progressId,
        userId: user._id
      },
      {
        $set: {
          completed,
          isCompleted,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!updatedProgress) {
      return NextResponse.json({ error: 'Workout progress not found' }, { status: 404 });
    }
    
    // If the workout is completed, update the user's streak and stats
    if (isCompleted && !updatedProgress.isCompleted) {
      // Update user's workout stats
      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { 'stats.workoutsCompleted': 1 }
        }
      );
      
      // Check if we need to update the streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if there was activity yesterday
      const yesterdayProgress = await WorkoutProgress.findOne({
        userId: user._id,
        date: yesterday.toISOString().split('T')[0],
        isCompleted: true
      });
      
      // If there was activity yesterday, increment the streak
      // Otherwise, reset the streak to 1
      const newStreak = yesterdayProgress ? (user.progression.streak || 0) + 1 : 1;
      
      // Update the user's streak
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: { 'progression.streak': newStreak },
          $max: { 'stats.bestStreak': newStreak }
        }
      );
    }
    
    return NextResponse.json({ 
      message: 'Workout progress updated successfully',
      workoutProgress: {
        id: updatedProgress._id.toString(),
        goalId: updatedProgress.goalId,
        type: updatedProgress.type,
        completed: updatedProgress.completed,
        total: updatedProgress.total,
        unit: updatedProgress.unit,
        isCompleted: updatedProgress.isCompleted,
        date: updatedProgress.date
      }
    });
  } catch (error) {
    console.error('Error updating workout progress:', error);
    return NextResponse.json({ error: 'Failed to update workout progress' }, { status: 500 });
  }
} 