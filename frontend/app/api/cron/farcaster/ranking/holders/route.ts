import { getTopUsersByKeysOwnedWithSocials } from "@/backend/user/user";
import { publishTopFarcasterKeyHoldersCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
  try {
    // return the number of keys owned by each user
    const response = await getTopUsersByKeysOwnedWithSocials(10);
    // Extracting wallets and numberOfKeys into separate arrays
    const data = response.data.map(user => ({ username: user.socialProfileName!, numHolders: user.numberOfHolders! }));

    // publish cast on Farcaster
    await publishTopFarcasterKeyHoldersCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster key by holders number" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
