import { ERRORS } from "@/lib/errors";
import { getTopUsersByKeysOwnedAndNumber } from "@/backend/user/user";
import { publishTopFarcasterKeyHoldersCast } from "@/lib/api/backend/farcaster";

export const GET = async () => {
    try {
        // return the number of keys owned by each user
        const topUsers = await getTopUsersByKeysOwnedAndNumber(10);
        // Extracting wallets and numberOfKeys into separate arrays
        const topWallets = topUsers.data.map(user => user.wallet);
        const numberOfKeys = topUsers.data.map(user => user.numberOfHolders?.toString());

        // Filter out undefined values from numberOfKeys array
        const filteredNumberOfKeys = numberOfKeys.filter(key => key !== undefined) as string[];

        // publish cast on Farcaster
        const cast = await publishTopFarcasterKeyHoldersCast(
            topWallets,
            filteredNumberOfKeys,
        );
        console.log(cast);
        return Response.json({ message: "Done: Top 10 Farcaster key by holders number" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};