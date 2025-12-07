
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Define Schema locally to avoid import issues if any
export const globalConfigSchema = pgTable('global_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

async function seed() {
  try {
    console.log('Initializing DB...');
    const client = new PGlite();
    await client.waitReady;
    const db = drizzlePglite(client, { schema: { globalConfigSchema } });

    // Note: PGlite is in-memory. Seeding it here won't persist to the running Next.js server 
    // UNLESS the Next.js server is also using the SAME PGlite instance (which it isn't, as they are separate processes).
    // OR if we are using a file-based PGlite or a real Postgres.
    
    // If the user is using a real Postgres, we need to connect to it.
    // Let's check if DATABASE_URL is passed in env.
    
    if (process.env.DATABASE_URL) {
        console.log('Using real Postgres...');
        // ... logic for real postgres
    } else {
        console.log('WARNING: Using in-memory PGlite. Data will NOT persist to the server process.');
        console.log('To fix this, you must provide a DATABASE_URL in .env or use a file-based PGlite path.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

seed();
