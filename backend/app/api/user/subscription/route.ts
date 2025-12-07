import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // In a real app, you would get the userId from the session/token
    // For now, we'll assume it's passed as a query param or header for testing
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json({ 
        plan: 'free', 
        status: 'active',
        credits: 0 
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
