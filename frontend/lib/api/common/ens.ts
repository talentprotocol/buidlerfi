import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

export interface GetEnsResponse {
  name?: string;
  avatar?: string;
}

export const getEnsProfile = async (address: `0x${string}`) => {
  const ensName = await client.getEnsName({ address: address });
  let avatar: string | undefined = undefined;
  if (ensName) {
    avatar = (await client.getEnsAvatar({ name: ensName as string })) as string;
  }
  return { name: ensName, avatar };
};
