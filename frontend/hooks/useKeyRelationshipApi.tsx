"use client";

import { GetKeyRelationshipArgs } from "@/backend/keyRelationship/keyRelationship";
import { getKeyRelationshipsSA } from "@/backend/keyRelationship/keyRelationshipServerAction";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuerySA } from "./useQuerySA";

export function useGetKeyRelationships(args: GetKeyRelationshipArgs, queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetKeyRelationships", args], options => getKeyRelationshipsSA(args, options), {
    ...queryOptions
  });
}
