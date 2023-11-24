/*
  Warnings:

  - The values [DISLIKE,LOVE,HATE,LAUGH,CRY,ANGRY,SURPRISED] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('UPVOTE', 'DOWNVOTE', 'LIKE');
ALTER TABLE "Reaction" ALTER COLUMN "reactionType" TYPE "ReactionType_new" USING ("reactionType"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "ReactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "replyId" INTEGER;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reaction" ALTER COLUMN "questionId" DROP NOT NULL;
ALTER TABLE "Reaction" ADD CONSTRAINT "unique_userId_replyId" UNIQUE ("userId", "replyId");