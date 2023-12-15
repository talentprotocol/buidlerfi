/*
  Warnings:

  - Made the column `holderId` on table `KeyRelationship` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `KeyRelationship` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "KeyRelationship" DROP CONSTRAINT "KeyRelationship_holderId_fkey";

-- DropForeignKey
ALTER TABLE "KeyRelationship" DROP CONSTRAINT "KeyRelationship_ownerId_fkey";

-- AlterTable
ALTER TABLE "KeyRelationship" ALTER COLUMN "holderId" SET NOT NULL,
ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "KeyRelationship" ADD CONSTRAINT "KeyRelationship_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyRelationship" ADD CONSTRAINT "KeyRelationship_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
