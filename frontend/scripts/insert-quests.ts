import { QUESTS } from "@/lib/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (const item of QUESTS) {
    const existingQuest = await prisma.quest.findFirst({
      where: {
        description: item.description
      }
    });
    if (existingQuest) {
      console.log(`Quest "${item.description}" already exists, skipping`);
      continue;
    }

    try {
      const res = await prisma.quest.create({
        data: {
          description: item.description,
          points: item.points,
          isActive: item.isActive
        }
      });

      console.log("Successfully inserted entry: ", res);
    } catch (err) {
      console.log("Error inserting entry: ", err);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
