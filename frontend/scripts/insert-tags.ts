import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  //We insert one by one in case there are duplicates.
  //InsertMany throws if there is a duplicate
  const tags = [
    { name: "Back-end" },
    { name: "Front-end" },
    { name: "Defi" },
    { name: "Product Design" },
    { name: "Graphic Design" },
    { name: "Operations" },
    { name: "Product" },
    { name: "DAOs" },
    { name: "Marketing" }
  ];
  for (const tag of tags) {
    try {
      await prisma.tag.create({
        data: tag
      });
    } catch (err) {
      console.log("Error inserting tag: ", tag.name, err);
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
