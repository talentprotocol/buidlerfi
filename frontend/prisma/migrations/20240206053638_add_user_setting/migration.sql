-- CreateEnum
CREATE TYPE "UserSettingKeyEnum" AS ENUM ('ONBOARDING_HAS_EXPORTED_WALLET', 'ONBOARDING_TASKLIST_DO_NOT_SHOW_AGAIN');

-- CreateTable
CREATE TABLE "UserSetting" (
    "userId" INTEGER NOT NULL,
    "key" "UserSettingKeyEnum" NOT NULL,
    "value" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key_key" ON "UserSetting"("userId", "key");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
