import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const TAGS = [
  { slug: 'international-student', label: 'International Student' },
  { slug: 'first-generation', label: 'First-Generation Student' },
  { slug: 'commuter', label: 'Commuter' },
  { slug: 'transfer-student', label: 'Transfer Student' },
  { slug: 'graduate-student', label: 'Graduate Student' },
  { slug: 'out-of-state', label: 'Out-of-State Student' },
];

async function main() {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { label: tag.label },
      create: tag,
    });
  }

  console.log(`Seeded ${TAGS.length} tags.`);
}

main();