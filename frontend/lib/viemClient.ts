import { PublicClient, createPublicClient, http } from "viem";
import { base, baseGoerli } from "viem/chains";

const globalForViem = global as unknown as { viemClient: PublicClient };

export const viemClient =
  globalForViem.viemClient ||
  createPublicClient({
    transport: http(process.env.INFURA_API_KEY),
    chain: process.env.NODE_ENV === "production" ? base : baseGoerli
  });

export default viemClient;
