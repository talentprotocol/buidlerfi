import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { publishNewUserCast } from "./farcaster";

export const publishNewUserKeysCastSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => publishNewUserCast(data.privyUserId), options);
};
