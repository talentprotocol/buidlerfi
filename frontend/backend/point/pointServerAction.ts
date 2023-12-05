"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { getCurrentPosition } from "./point";

export const getCurrentPositionSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getCurrentPosition(data.privyUserId), options);
};
