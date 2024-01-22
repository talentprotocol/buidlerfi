import { getTopUsersByKeysOwnedWithSocials } from "@/backend/user/user";
import { publishTopFarcasterKeyHoldersCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const revalidate = 0;
export const GET = async () => {
  console.log("Running cron job: Top 10 Farcaster key by holders number");
  try {
    // return the number of keys owned by each user
    console.log("Fetching top 10 Farcaster key by holders number");
    const response = await getTopUsersByKeysOwnedWithSocials(10);
    // Extracting wallets and numberOfKeys into separate arrays
    console.log("Parsing data");
    const data = response.data.map(user => ({ username: user.socialProfileName!, numHolders: user.numberOfHolders! }));

    console.log("Publishing cast");
    // publish cast on Farcaster
    await publishTopFarcasterKeyHoldersCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster key by holders number" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
