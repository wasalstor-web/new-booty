import { db } from '@/libs/DB';
import { globalConfigSchema } from '@/models/Schema';
import { AppConfig } from '@/utils/AppConfig';
import { eq } from 'drizzle-orm';

export const Logo = async (props: {
  isTextHidden?: boolean;
}) => {
  let siteName = AppConfig.name;
  
  try {
    const config = await db.select().from(globalConfigSchema).where(eq(globalConfigSchema.key, 'site_name'));
    if (config.length > 0) {
      siteName = config[0].value;
    }
  } catch (e) {
    // Fallback
  }

  return (
    <div className="flex items-center text-2xl font-bold tracking-wider">
      {!props.isTextHidden && (
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {siteName}
        </span>
      )}
    </div>
  );
};
