import { db } from '@/libs/DB';
import { globalConfigSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const configs = await db.select().from(globalConfigSchema);
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(configMap);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updates = Object.entries(body);
    
    for (const [key, value] of updates) {
      if (typeof value !== 'string') continue;

      const existing = await db.select().from(globalConfigSchema).where(eq(globalConfigSchema.key, key));

      if (existing.length > 0) {
        await db.update(globalConfigSchema)
          .set({ value })
          .where(eq(globalConfigSchema.key, key));
      } else {
        await db.insert(globalConfigSchema).values({ key, value });
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
