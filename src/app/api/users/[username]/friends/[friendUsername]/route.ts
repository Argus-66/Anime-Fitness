import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function DELETE(
  req: Request, 
  { params }: { params: { username: string; friendUsername: string } }
) {
  try {
    await connectDB();
    console.log('Remove friend request:', params);

    // Validate input
    if (!params.username || !params.friendUsername) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const user = await User.findOne({ username: params.username });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the friend exists in the user's friends list
    const friendIndex = user.friends.findIndex(
      (friend: { username: string }) => friend.username === params.friendUsername
    );

    if (friendIndex === -1) {
      return NextResponse.json({ error: 'Friend not found in user\'s friends list' }, { status: 404 });
    }

    // Remove the friend
    user.friends.splice(friendIndex, 1);
    await user.save();

    console.log('Friend removed successfully');

    return NextResponse.json({ 
      message: 'Friend removed successfully' 
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ 
      error: 'Failed to remove friend', 
      details: (error as Error).message 
    }, { status: 500 });
  }
} 