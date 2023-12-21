import { PAGINATION_LIMIT } from "@/lib/constants";
import { ApiResponse } from "@/models/apiResponse.model";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAxios } from "./useAxios";

export const useInfiniteQueryAxios = <
  TResponse extends ApiResponse<Array<unknown>>,
  TQueryKey extends QueryKey = QueryKey,
  TParams = unknown
>(
  key: TQueryKey,
  apiRoute: string,
  options?: SimpleUseQueryOptions<InfiniteData<TResponse>>,
  params?: TParams
) => {
  const axios = useAxios();
  const query = useInfiniteQuery(
    key,
    async ({ pageParam = 0 }) => {
      const res = await axios
        .get<TResponse>(apiRoute, { params: { ...params, offset: pageParam } })
        .then(res => res.data)
        .then(res => res.data);
      return res;
    },
    {
      ...options,
      getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length * PAGINATION_LIMIT : undefined)
    }
  );

  const res = useMemo(
    () => ({ ...query, data: query.data?.pages.flatMap(page => page) as TResponse["data"] | undefined }),
    [query]
  );

  return res;
};
