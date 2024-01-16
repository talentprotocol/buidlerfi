"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { claim, getCurrentPosition } from "./point";

export const getCurrentPositionSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getCurrentPosition(data.privyUserId), options);
};

export const claimSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => claim(data.privyUserId), options);
};
