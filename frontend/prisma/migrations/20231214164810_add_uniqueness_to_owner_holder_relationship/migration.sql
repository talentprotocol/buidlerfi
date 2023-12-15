/*
  Warnings:

  - A unique constraint covering the columns `[holderId,ownerId]` on the table `KeyRelationship` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KeyRelationship_holderId_ownerId_key" ON "KeyRelationship"("holderId", "ownerId");
