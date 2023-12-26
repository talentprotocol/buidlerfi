import { processAnyPendingTransactions } from "@/backend/transaction/transaction";

export const maxDuration = 300;
export const revalidate = 0;

export const GET = async () => {
  await processAnyPendingTransactions("");
  return Response.json({ message: "Done" });
};
