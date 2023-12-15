import { processAnyPendingTransactions } from "@/backend/transaction/transaction";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  await processAnyPendingTransactions("").catch(err => console.error(err));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
