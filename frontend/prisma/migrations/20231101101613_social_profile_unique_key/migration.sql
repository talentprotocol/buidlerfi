/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `SocialProfile` will be added. If there are existing duplicate values, this will fail.

*/

-- Delete duplicates to respect new unique constraint
WITH CTE AS (
    SELECT id, 
           ROW_NUMBER() OVER(PARTITION BY type, "userId" ORDER BY id) AS rn
    FROM "SocialProfile"
)
DELETE FROM "SocialProfile"
WHERE id IN (SELECT id FROM CTE WHERE rn > 1);

-- CreateIndex
CREATE UNIQUE INDEX "SocialProfile_userId_type_key" ON "SocialProfile"("userId", "type");
