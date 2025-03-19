import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || '';

  try {
    await connectDB();
    console.log('Search API called with username:', username);

    // If the search term is empty, return an empty array
    if (!username.trim()) {
      return NextResponse.json([]);
    }

    // Use a simple regex search
    const users = await User.find({
      username: { $regex: username, $options: 'i' } // Case-insensitive search
    })
      .select('username progression')
      .limit(10)
      .lean();
    
    console.log('Search results:', users);

    // If no results, try a more flexible search
    if (users.length === 0) {
      console.log('No results found, trying more flexible search');
      
      // Get all users and filter manually
      const allUsers = await User.find()
        .select('username progression')
        .limit(20)
        .lean();
      
      // Format the results
      const formattedUsers = allUsers
        .filter(user => {
          // Ensure user has a username property
          if (!user || typeof user.username !== 'string') return false;
          
          // Check if username includes the search term (case insensitive)
          return user.username.toLowerCase().includes(username.toLowerCase());
        })
        .map(user => ({
          username: user.username,
          level: user.progression?.level || 1
        }))
        .slice(0, 10);
      
      console.log('Flexible search results:', formattedUsers);
      return NextResponse.json(formattedUsers);
    }

    // Format the results
    const formattedUsers = users.map(user => ({
      username: user.username || '',
      level: user.progression?.level || 1
    }));

    console.log('Formatted results:', formattedUsers);
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 