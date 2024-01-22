-- CreateTable
CREATE TABLE "SocialProfileFollowing" (
    "profileId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialProfileFollowing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialProfileFollowing_profileId_followingId_key" ON "SocialProfileFollowing"("profileId", "followingId");

-- AddForeignKey
ALTER TABLE "SocialProfileFollowing" ADD CONSTRAINT "SocialProfileFollowing_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SocialProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProfileFollowing" ADD CONSTRAINT "SocialProfileFollowing_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "SocialProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
