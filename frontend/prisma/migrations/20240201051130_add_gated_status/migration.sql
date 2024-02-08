-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isGated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isGated" BOOLEAN NOT NULL DEFAULT true;
