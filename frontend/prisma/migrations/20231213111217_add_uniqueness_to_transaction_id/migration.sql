/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Key` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Key_transactionId_key" ON "Key"("transactionId");
