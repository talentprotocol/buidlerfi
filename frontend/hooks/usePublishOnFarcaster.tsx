import { publishNewUserKeysCastSA } from "@/backend/farcaster/farcasterServerActions";
import { useMutationSA } from "./useMutationSA";

export const usePublishOnFarcaster = () => {
  return useMutationSA(async options => publishNewUserKeysCastSA(options));
};
