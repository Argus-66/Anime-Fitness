import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await connectDB();
    console.log('Connected to database');

    // List all users
    const allUsers = await User.find().select('username email progression').lean();
    console.log('All users:', allUsers);

    // Try to find Argus specifically
    const argusUser = await User.findOne({ username: 'Argus' }).lean();
    console.log('Argus user:', argusUser);

    // Try a regex search
    const regexUsers = await User.find({
      username: { $regex: 'a', $options: 'i' }
    }).select('username').lean();
    console.log('Regex search for "a":', regexUsers);

    return NextResponse.json({
      message: 'Database test',
      userCount: allUsers.length,
      users: allUsers.map(user => ({
        username: user.username,
        email: user.email,
        level: user.progression?.level || 1
      })),
      argusFound: !!argusUser,
      regexResults: regexUsers
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ error: 'Database test failed', details: (error as Error).message }, { status: 500 });
  }
} 