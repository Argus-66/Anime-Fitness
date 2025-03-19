import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import WorkoutGoal from '@/models/WorkoutGoal';
import mongoose from 'mongoose';

// GET /api/users/[username]/workout-goals
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
    
    // Fetch workout goals from the database
    const workoutGoals = await WorkoutGoal.find({ 
      userId: user._id 
    }).sort({ createdAt: 1 });
    
    // Format the response
    const formattedGoals = workoutGoals.map(goal => ({
      id: goal._id.toString(),
      type: goal.type,
      amount: goal.amount,
      unit: goal.unit
    }));
    
    return NextResponse.json({ workoutGoals: formattedGoals });
  } catch (error) {
    console.error('Error fetching workout goals:', error);
    return NextResponse.json({ error: 'Failed to fetch workout goals' }, { status: 500 });
  }
}

// PUT /api/users/[username]/workout-goals
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
    
    // For now, we'll skip authentication check since we're using local storage auth
    // In a production app, you would verify the user's session here
    
    // Parse request body
    const { workoutGoals } = await request.json();
    
    if (!Array.isArray(workoutGoals)) {
      return NextResponse.json({ error: 'Invalid workout goals format' }, { status: 400 });
    }
    
    // Delete existing workout goals
    await WorkoutGoal.deleteMany({ userId: user._id });
    
    // Create new workout goals
    const createdGoals = await Promise.all(
      workoutGoals.map(async (goal: { type: string; amount: number; unit: string }) => {
        return WorkoutGoal.create({
          userId: user._id,
          type: goal.type,
          amount: goal.amount,
          unit: goal.unit
        });
      })
    );
    
    return NextResponse.json({ 
      message: 'Workout goals updated successfully',
      workoutGoals: createdGoals.map(goal => ({
        id: goal._id.toString(),
        type: goal.type,
        amount: goal.amount,
        unit: goal.unit
      }))
    });
  } catch (error) {
    console.error('Error updating workout goals:', error);
    return NextResponse.json({ error: 'Failed to update workout goals' }, { status: 500 });
  }
} 