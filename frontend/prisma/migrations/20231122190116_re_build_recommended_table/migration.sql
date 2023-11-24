/*
  Warnings:

  - You are about to drop the column `recommendedUserId` on the `RecommendedUser` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedUserWallet` on the `RecommendedUser` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUserId` on the `RecommendedUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[forId,wallet]` on the table `RecommendedUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `forId` to the `RecommendedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet` to the `RecommendedUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecommendedUser" DROP CONSTRAINT "RecommendedUser_recommendedUserId_fkey";

-- DropForeignKey
ALTER TABLE "RecommendedUser" DROP CONSTRAINT "RecommendedUser_sourceUserId_fkey";

-- DropIndex
DROP INDEX "RecommendedUser_sourceUserId_recommendedUserWallet_key";

-- AlterTable
ALTER TABLE "RecommendedUser" DROP COLUMN "recommendedUserId",
DROP COLUMN "recommendedUserWallet",
DROP COLUMN "sourceUserId",
ADD COLUMN     "forId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER,
ADD COLUMN     "wallet" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RecommendedUser_forId_wallet_key" ON "RecommendedUser"("forId", "wallet");

-- AddForeignKey
ALTER TABLE "RecommendedUser" ADD CONSTRAINT "RecommendedUser_forId_fkey" FOREIGN KEY ("forId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedUser" ADD CONSTRAINT "RecommendedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
