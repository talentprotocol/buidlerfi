-- DropForeignKey
ALTER TABLE "RecommendedUser" DROP CONSTRAINT "RecommendedUser_recommendedUserWallet_fkey";

-- AlterTable
ALTER TABLE "RecommendedUser" ADD COLUMN     "recommendedUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "RecommendedUser" ADD CONSTRAINT "RecommendedUser_recommendedUserId_fkey" FOREIGN KEY ("recommendedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
