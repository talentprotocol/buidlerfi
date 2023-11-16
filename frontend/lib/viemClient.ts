import { PublicClient, createPublicClient, http } from "viem";
import { base, baseGoerli } from "viem/chains";

if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_SECRET) throw new Error("PRIVY_APP_ID or PRIVY_SECRET is not set");

const globalForViem = global as unknown as { viemClient: PublicClient };

export const viemClient =
  globalForViem.viemClient ||
  createPublicClient({
    transport: http(),
    chain: process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? base : baseGoerli
  });

export default viemClient;
