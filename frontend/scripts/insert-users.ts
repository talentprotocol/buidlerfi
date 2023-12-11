import { PrismaClient } from "@prisma/client";
import csvToJson from "csvtojson/v2";

const prisma = new PrismaClient();
async function main() {
  //Import users from csv. I use it to import users from prod for testing purposes
  await csvToJson()
    .fromFile("./scripts/User.csv")
    .then(async jsonObj => {
      for (const user of jsonObj) {
        try {
          const res = await prisma.user.create({
            data: {
              id: Number(user.id),
              wallet: user.wallet,
              isAdmin: false,
              isActive: true,
              privyUserId: user.privyUserId,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              socialWallet: user.socialWallet
            }
          });
          console.log("Successfully inserted user: ", res);
        } catch (err) {
          console.log("Error inserting user: ", user.wallet, err);
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
