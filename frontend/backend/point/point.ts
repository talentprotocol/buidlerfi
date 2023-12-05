import prisma from "@/lib/prisma";

export const getCurrentPosition = async (privyUserId: string) => {
  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  if (!currentUser) {
    return { data: [] };
  }

  const result: [{ userId: string; score: number; position: number }] = await prisma.$queryRaw`
    SELECT leaderboard."userId", leaderboard.score, leaderboard.position FROM (
      SELECT "userId", sum("points") as score, row_number() OVER (order by sum("points") desc) as position
      FROM "Point"
      GROUP BY "userId"
      HAVING sum("points") > 0
    ) AS leaderboard WHERE "userId" = ${currentUser.id}
  `;

  return { data: result };
};
