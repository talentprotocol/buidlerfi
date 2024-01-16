import prisma from "@/lib/prisma";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
    try {
        // Fetch trades, ordered by timestamp (or another field indicating recency)
        const trades = await prisma.trade.findMany({
          orderBy: {
            timestamp: 'desc',
          },
          select: {
            ownerAddress: true,
            ethCost: true,
            timestamp: true, 
          }
        });
    
        // Filter out the most recent trade for each user
        const mostRecentTrades = new Map();
        trades.forEach(trade => {
          if (!mostRecentTrades.has(trade.ownerAddress)) {
            mostRecentTrades.set(trade.ownerAddress, trade);
          }
        });
        
        // Convert to array and sort by ethCost
        const sortedTrades = Array.from(mostRecentTrades.values()).sort((a, b) => (b.ethCost - a.ethCost)).slice(0, 10);
        return Response.json({ sortedTrades });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};