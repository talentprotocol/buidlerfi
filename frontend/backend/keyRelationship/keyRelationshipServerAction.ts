"use server";

import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { GetKeyRelationshipArgs, getKeyRelationships } from "./keyRelationship";

export const getKeyRelationshipsSA = async (args: GetKeyRelationshipArgs, options: ServerActionOptions) => {
  return serverActionWrapper(() => getKeyRelationships(args), options);
};
