import prisma from "@/lib/prisma";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
    try {
        // Aggregate trade data
        const topUsers = await prisma.trade.groupBy({
            by: ['ownerAddress'],
            // Calulcate eth volume for each user
            _sum: {
                ethCost: true,
            },
            orderBy: {
                _sum: {
                    ethCost: 'desc',
                },
            },
            take: 10
        });

        // Return the result
        return Response.json({ topUsers });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};