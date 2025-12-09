import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.review.count({
    where: {
      isVerified: true,
      user: {
        NOT: {
          OR: [
            { name: { contains: "Test", mode: "insensitive" } },
            { email: { contains: "test", mode: "insensitive" } },
          ],
        },
      },
    },
  });

  console.log(`Total verified reviews (excluding Test User): ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
