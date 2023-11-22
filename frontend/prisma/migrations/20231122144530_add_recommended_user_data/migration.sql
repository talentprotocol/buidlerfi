/*
  Warnings:

  - Added the required column `avatarUrl` to the `RecommendedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `RecommendedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecommendedUser" ADD COLUMN     "avatarUrl" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
