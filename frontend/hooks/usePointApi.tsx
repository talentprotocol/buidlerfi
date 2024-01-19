import { getPointsHistory } from "@/backend/point/point";
import { claimSA, getCurrentPositionSA } from "@/backend/point/pointServerAction";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export function useGetCurrentPosition(queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetCurrentPosition"], options => getCurrentPositionSA(options), {
    ...queryOptions
  });
}

export function useGetPointHistory() {
  const axios = useAxios();
  return useQuery(["useGetPointHistory"], () =>
    axios
      .get<ReturnType<typeof getPointsHistory>>("/api/point/me")
      .then(res => res.data)
      .then(res => res.data)
  );
}

export function useClaimPoint() {
  return useMutationSA(options => claimSA(options));
}
