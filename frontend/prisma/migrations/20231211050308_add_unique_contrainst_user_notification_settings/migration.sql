/*
  Warnings:

  - A unique constraint covering the columns `[userId,notificationType]` on the table `UserNotificationSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationSetting_userId_notificationType_key" ON "UserNotificationSetting"("userId", "notificationType");
