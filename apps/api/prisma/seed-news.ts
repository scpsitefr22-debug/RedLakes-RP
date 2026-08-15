import { PrismaClient } from '@prisma/client';
import { newsArticles } from '../../web/src/data/news';

const prisma = new PrismaClient();

export async function seedNews() {
  for (const a of newsArticles) {
    await prisma.newsArticle.upsert({
      where: { slug: a.id },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        date: new Date(a.date),
        category: a.category,
        image: a.image,
        featured: a.featured ?? false,
      },
      create: {
        slug: a.id,
        title: a.title,
        excerpt: a.excerpt,
        date: new Date(a.date),
        category: a.category,
        image: a.image,
        featured: a.featured ?? false,
      },
    });
  }
  console.log(`News articles seeded: ${newsArticles.length}`);
}

if (require.main === module) {
  seedNews()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
