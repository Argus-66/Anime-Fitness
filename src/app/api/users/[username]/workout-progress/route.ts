import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WorkoutProgress from '@/models/WorkoutProgress';
import mongoose from 'mongoose';

// GET /api/users/[username]/workout-progress
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
    
    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch workout progress from the database
    const workoutProgress = await WorkoutProgress.find({ 
      userId: user._id,
      date: today
    }).sort({ createdAt: 1 });
    
    // Format the response
    const formattedProgress = workoutProgress.map(progress => ({
      id: progress._id.toString(),
      goalId: progress.goalId,
      type: progress.type,
      completed: progress.completed,
      total: progress.total,
      unit: progress.unit,
      isCompleted: progress.isCompleted,
      date: progress.date
    }));
    
    return NextResponse.json({ workoutProgress: formattedProgress });
  } catch (error) {
    console.error('Error fetching workout progress:', error);
    return NextResponse.json({ error: 'Failed to fetch workout progress' }, { status: 500 });
  }
}

// POST /api/users/[username]/workout-progress
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
    const { workoutProgress } = await request.json();
    
    if (!Array.isArray(workoutProgress)) {
      return NextResponse.json({ error: 'Invalid workout progress format' }, { status: 400 });
    }
    
    // Create new workout progress entries
    const createdProgress = await Promise.all(
      workoutProgress.map(async (progress: any) => {
        return WorkoutProgress.create({
          userId: user._id,
          goalId: progress.goalId,
          type: progress.type,
          completed: progress.completed,
          total: progress.total,
          unit: progress.unit,
          isCompleted: progress.isCompleted,
          date: progress.date || new Date().toISOString().split('T')[0]
        });
      })
    );
    
    return NextResponse.json({ 
      message: 'Workout progress initialized successfully',
      workoutProgress: createdProgress.map(progress => ({
        id: progress._id.toString(),
        goalId: progress.goalId,
        type: progress.type,
        completed: progress.completed,
        total: progress.total,
        unit: progress.unit,
        isCompleted: progress.isCompleted,
        date: progress.date
      }))
    });
  } catch (error) {
    console.error('Error initializing workout progress:', error);
    return NextResponse.json({ error: 'Failed to initialize workout progress' }, { status: 500 });
  }
} 