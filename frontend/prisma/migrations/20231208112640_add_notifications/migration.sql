-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASKED_QUESTION', 'REPLIED_YOUR_QUESTION', 'REPLIED_OTHER_QUESTION', 'QUESTION_UPVOTED', 'QUESTION_DOWNVOTED', 'REPLY_REACTION', 'KEYBUY', 'KEYSELL', 'USER_INVITED', 'FRIEND_JOINED', 'POINTS_DROP', 'NEW_INVITE_CODE', 'SYSTEM');

-- CreateTable
CREATE TABLE "Notification" (
    "targetUserId" INTEGER NOT NULL,
    "sourceUserId" INTEGER,
    "description" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "type" "NotificationType" NOT NULL,
    "referenceId" INTEGER,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationSetting" (
    "userId" INTEGER NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationSetting" ADD CONSTRAINT "UserNotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
