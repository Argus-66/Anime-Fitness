import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectDB();
    return NextResponse.json({
      status: 'success',
      connected: db.connection.readyState === 1,
      database: db.connection.name
    });
  } catch (error) {
    console.error('Test DB Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 