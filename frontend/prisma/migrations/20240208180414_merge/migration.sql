/*
  Warnings:

  - You are about to drop the column `isGated` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isGated` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `_QuestionToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_QuestionToTag" DROP CONSTRAINT "_QuestionToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToTag" DROP CONSTRAINT "_QuestionToTag_B_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "isGated",

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "isGated",
ADD COLUMN     "replyGated" BOOLEAN DEFAULT true,
ADD COLUMN     "tagId" INTEGER,
ADD COLUMN     "topicId" INTEGER;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "questionId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_QuestionToTag";

-- CreateTable
CREATE TABLE "Topic" (
    "name" VARCHAR(255) NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicKeyRelationship" (
    "holderId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicKeyRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TopicKeyRelationship_holderId_topicId_key" ON "TopicKeyRelationship"("holderId", "topicId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicKeyRelationship" ADD CONSTRAINT "TopicKeyRelationship_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicKeyRelationship" ADD CONSTRAINT "TopicKeyRelationship_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
