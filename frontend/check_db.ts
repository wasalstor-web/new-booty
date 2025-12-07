
import { db } from './src/libs/DB';
import { globalConfigSchema } from './src/models/Schema';

async function checkConfig() {
  try {
    const configs = await db.select().from(globalConfigSchema);
    console.log('Current Global Configs:', configs);
  } catch (error) {
    console.error('Error querying DB:', error);
  }
  process.exit(0);
}

checkConfig();
