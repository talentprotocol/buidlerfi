"use client";

import { getKeyRelationships, getTopicKeyRelationships } from "@/backend/keyRelationship/keyRelationship";
import { useQuery } from "wagmi";
import { useAxios } from "./useAxios";

export function useGetKeyRelationships(address?: string, side: "holder" | "owner" = "holder") {
  const axios = useAxios();
  return useQuery(
    ["useGetKeyRelationships", address, side],
    () =>
      axios
        .get<ReturnType<typeof getKeyRelationships>>("/api/keyrelationship", { params: { address, side } })
        .then(res => res.data)
        .then(res => res.data),
    {
      enabled: !!address
    }
  );
}

export function useGetTopicKeyRelationships(address?: string, topicId?: number) {
  const axios = useAxios();
  return useQuery(
    ["useGetTopicKeyRelationships", address],
    () =>
      axios
        .get<ReturnType<typeof getTopicKeyRelationships>>("/api/topickeyrelationship", { params: { address, topicId } })
        .then(res => res.data)
        .then(res => res.data),
    {
      enabled: !!address
    }
  );
}
