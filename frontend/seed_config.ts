
import { db } from './src/libs/DB';
import { globalConfigSchema } from './src/models/Schema';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('Seeding global config...');
    
    const key = 'site_name';
    const value = 'My SaaS Platform'; // Initial value to prove it works

    const existing = await db.select().from(globalConfigSchema).where(eq(globalConfigSchema.key, key));

    if (existing.length > 0) {
      console.log('Updating existing key...');
      await db.update(globalConfigSchema)
        .set({ value })
        .where(eq(globalConfigSchema.key, key));
    } else {
      console.log('Inserting new key...');
      await db.insert(globalConfigSchema).values({ key, value });
    }

    console.log('Seeding complete. Site name set to:', value);
  } catch (error) {
    console.error('Error seeding:', error);
  }
  process.exit(0);
}

seed();
