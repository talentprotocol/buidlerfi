/*
  Warnings:

  - You are about to drop the `Key` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_holderId_fkey";

-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_transactionId_fkey";

-- DropTable
DROP TABLE "Key";

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "holderAddress" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "ethCost" BIGINT,
    "protocolFee" BIGINT,
    "ownerFee" BIGINT,
    "block" BIGINT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyRelationship" (
    "id" SERIAL NOT NULL,
    "holderId" INTEGER,
    "ownerId" INTEGER,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_hash_key" ON "Trade"("hash");

-- AddForeignKey
ALTER TABLE "KeyRelationship" ADD CONSTRAINT "KeyRelationship_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyRelationship" ADD CONSTRAINT "KeyRelationship_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
