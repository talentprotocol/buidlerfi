import { PrismaClient } from "@prisma/client";

interface quests {
  description: string;
  points: number;
  isActive: boolean;
  id: number;
  createdAt: string;
  updatedAt: string;
}
const quests = [
  {
    description: "install app & turn on notifications",
    points: 50
  },
  {
    description: "link your web3 socials",
    points: 100
  },
  {
    description: "create your key",
    points: 200
  },
  {
    description: "deposit >0.01 eth",
    points: 350
  },
  {
    description: "buy 1 key and ask 1 question",
    points: 300
  }
];

const prisma = new PrismaClient();

async function main() {
  for (const item of quests) {
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
          isActive: true
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
