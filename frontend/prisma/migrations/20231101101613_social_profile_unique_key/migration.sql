/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `SocialProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocialProfile_userId_type_key" ON "SocialProfile"("userId", "type");
