import { PrismaClient } from "@prisma/client";
import csvToJson from "csvtojson/v2";

const prisma = new PrismaClient();
async function main() {
  //Import users from csv. I use it to import users from prod for testing purposes
  await csvToJson()
    .fromFile("./scripts/Notification.csv")
    .then(async jsonObj => {
      for (const notification of jsonObj) {
        try {
          const res = await prisma.notification.create({
            data: {
              targetUserId: Number(notification.targetUserId),
              sourceUserId: Number(notification.sourceUserId),
              description: String(notification.description),
              isRead: Boolean(notification.isRead),
              readAt: null,
              type: notification.type,
              referenceId: Number(notification.referenceId),
              id: Number(notification.id),
              createdAt: new Date(notification.createdAt),
              updatedAt: new Date(notification.updatedAt)
            }
          });
          console.log("Successfully inserted notification: ", res);
        } catch (err) {
          console.log("Error inserting notification: ", notification.profileName, err);
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
