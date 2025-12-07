import { db } from '@/libs/DB';
import { globalConfigSchema } from '@/models/Schema';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = async () => {
  const t = await getTranslations('Hero');
  
  const configs = await db.select().from(globalConfigSchema);
  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const title = configMap['hero_title'] || t('title');
  const description = configMap['hero_description'] || t('description');
  const buttonText = configMap['hero_button_text'] || t('primary_button');
  const buttonLink = configMap['hero_button_link'] || '/sign-up';

  return (
    <Section className="py-36">
      <CenteredHero
        title={
          <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 bg-clip-text text-transparent">
            {title}
          </span>
        }
        description={description}
        buttons={(
          <a
            className={buttonVariants({ size: 'lg' })}
            href={buttonLink}
          >
            {buttonText}
          </a>
        )}
      />
    </Section>
  );
};
