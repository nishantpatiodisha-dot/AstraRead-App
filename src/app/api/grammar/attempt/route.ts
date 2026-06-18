import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { grammarAttempts, users } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { exerciseId, answer, isCorrect } = body;

    if (!exerciseId || typeof answer !== 'string' || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Since we don't have auth, get or create a default user
    let user = await db.query.users.findFirst();
    if (!user) {
      const [newUser] = await db.insert(users).values({
        authProviderUserId: 'default-user-' + Date.now(),
        displayName: 'Default User',
        email: 'default@example.com',
      }).returning();
      user = newUser;
    }

    const [attempt] = await db.insert(grammarAttempts).values({
      userId: user.id,
      exerciseId,
      answer,
      isCorrect,
    }).returning();

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("Error saving grammar attempt:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
