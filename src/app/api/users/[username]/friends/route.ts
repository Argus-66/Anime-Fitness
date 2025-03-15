import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// Define the type for a friend
interface Friend {
  username: string;
  level: number;
}

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    await connectDB();
    console.log('Get friends request for user:', params.username);

    // Validate input
    if (!params.username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await User.findOne({ username: params.username });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user friends:', user.friends);

    return NextResponse.json({ 
      friends: user.friends || []
    });
  } catch (error) {
    console.error('Error getting friends:', error);
    return NextResponse.json({ 
      error: 'Failed to get friends', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { username: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const { friendUsername } = body;
    
    console.log('Add friend request:', { currentUser: params.username, friendUsername });

    // Validate input
    if (!friendUsername || !params.username) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if trying to add self as friend
    if (params.username === friendUsername) {
      console.log('Cannot add self as friend');
      return NextResponse.json({ error: 'Cannot add yourself as a friend' }, { status: 400 });
    }

    const user = await User.findOne({ username: params.username });
    const friend = await User.findOne({ username: friendUsername });
    
    console.log('Found user:', user ? 'Yes' : 'No');
    console.log('Found friend:', friend ? 'Yes' : 'No');

    if (!user || !friend) {
      return NextResponse.json({ error: 'User or friend not found' }, { status: 404 });
    }

    // Check if already friends
    const alreadyFriends = user.friends.some((f: Friend) => f.username === friendUsername);
    console.log('Already friends:', alreadyFriends);
    
    if (alreadyFriends) {
      return NextResponse.json({ error: 'Already friends with this user' }, { status: 400 });
    }

    // Add friend
    const friendLevel = friend.progression?.level || 1;
    console.log('Adding friend with level:', friendLevel);
    
    user.friends.push({ 
      username: friend.username, 
      level: friendLevel
    });
    await user.save();
    
    console.log('Friend added successfully');

    return NextResponse.json({ 
      message: 'Friend added successfully',
      friend: { username: friend.username, level: friendLevel }
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json({ 
      error: 'Failed to add friend', 
      details: (error as Error).message 
    }, { status: 500 });
  }
} 