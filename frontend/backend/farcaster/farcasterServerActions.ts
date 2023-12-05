import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { publishNewCast } from "./farcaster";

export const publishNewUserKeysCastSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => publishNewCast(data.privyUserId), options);
};
