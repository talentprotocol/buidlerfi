import { PrismaClient } from "@prisma/client";
import csvToJson from "csvtojson/v2";

const prisma = new PrismaClient();
async function main() {
  //Import users from csv. I use it to import users from prod for testing purposes
  await csvToJson()
    .fromFile("./scripts/InviteCode.csv")
    .then(async jsonObj => {
      for (const item of jsonObj) {
        try {
          const res = await prisma.inviteCode.create({
            data: {
              id: Number(item.id),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              code: item.code,
              maxUses: Number(item.maxUses),
              used: Number(item.used),
              userId: Number(item.userId),
              isActive: Boolean(item.isActive)
            }
          });
          console.log("Successfully inserted entry: ", res);
        } catch (err) {
          console.log("Error inserting entry: ", item.profileName, err);
        }
      }
    });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
