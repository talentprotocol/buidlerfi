/*
  Warnings:

  - You are about to alter the column `questionContent` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "questionContent" SET DATA TYPE VARCHAR(500);

-- CreateTable
CREATE TABLE "UserSocialData" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userWallet" TEXT NOT NULL,
    "talentProtocolData" JSONB,
    "farcasterData" JSONB,
    "ensData" JSONB,

    CONSTRAINT "UserSocialData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSocialData_userWallet_key" ON "UserSocialData"("userWallet");

-- AddForeignKey
ALTER TABLE "UserSocialData" ADD CONSTRAINT "UserSocialData_userWallet_fkey" FOREIGN KEY ("userWallet") REFERENCES "User"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;
