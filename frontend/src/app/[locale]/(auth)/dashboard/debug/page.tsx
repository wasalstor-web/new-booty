import { db } from '@/libs/DB';
import { globalConfigSchema } from '@/models/Schema';
import { AppConfig } from '@/utils/AppConfig';

export default async function DebugPage() {
  let dbConfig = [];
  let error = null;
  
  try {
    dbConfig = await db.select().from(globalConfigSchema);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold">AppConfig</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(AppConfig, null, 2)}</pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Database Config (global_config)</h2>
        {error ? (
          <div className="text-red-500">Error fetching DB: {error}</div>
        ) : (
          <pre className="bg-gray-100 p-4 rounded">
            {dbConfig.length > 0 ? JSON.stringify(dbConfig, null, 2) : 'Table is empty'}
          </pre>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Environment</h2>
        <pre className="bg-gray-100 p-4 rounded">
          NODE_ENV: {process.env.NODE_ENV}
          {'\n'}
          DATABASE_URL: {process.env.DATABASE_URL ? 'Set' : 'Not Set'}
        </pre>
      </div>
    </div>
  );
}
