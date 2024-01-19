import { PublicClient, createPublicClient, http } from "viem";
import { base, baseGoerli } from "viem/chains";

const globalForViem = global as unknown as { viemClient: PublicClient };

export const viemClient =
  globalForViem.viemClient ||
  createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_INFURA_APY_KEY),
    chain: process.env.NODE_ENV === "production" ? base : baseGoerli
  });

export default viemClient;
