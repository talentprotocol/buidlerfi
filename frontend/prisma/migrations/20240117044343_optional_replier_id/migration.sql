-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_replierId_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "replierId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_replierId_fkey" FOREIGN KEY ("replierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
