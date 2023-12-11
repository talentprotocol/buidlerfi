import { PrismaClient } from "@prisma/client";
import csvToJson from "csvtojson/v2";

const prisma = new PrismaClient();
async function main() {
  //Import users from csv. I use it to import users from prod for testing purposes
  await csvToJson()
    .fromFile("./scripts/SocialProfile.csv")
    .then(async jsonObj => {
      for (const profile of jsonObj) {
        try {
          const res = await prisma.socialProfile.create({
            data: {
              id: Number(profile.id),
              profileName: profile.profileName,
              type: profile.type,
              profileImage: profile.profileImage,
              userId: Number(profile.userId)
            }
          });
          console.log("Successfully inserted profile: ", res);
        } catch (err) {
          console.log("Error inserting profile: ", profile.profileName, err);
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
