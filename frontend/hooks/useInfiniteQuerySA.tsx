import { PAGINATION_LIMIT } from "@/lib/constants";
import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { usePrivy } from "@privy-io/react-auth";
import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useInfiniteQuerySA = <TResponse extends Array<unknown>, TQueryKey extends QueryKey = QueryKey>(
  key: TQueryKey,
  queryFn: (options: ServerActionOptions) => Promise<ServerActionResponse<TResponse>>,
  options?: SimpleUseQueryOptions<InfiniteData<TResponse>>
) => {
  const { getAccessToken } = usePrivy();
  const query = useInfiniteQuery(
    key,
    async ({ pageParam = 0 }) => {
      if (process.env.NODE_ENV === "development") console.log("Request Log - Start: ", key);
      const token = await getAccessToken();
      const res = await queryFn({ authorization: token, pagination: { offset: pageParam } });
      if (process.env.NODE_ENV === "development") console.log("Request Log - End: ", res);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    {
      ...options,
      getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length * PAGINATION_LIMIT : undefined)
    }
  );

  const res = useMemo(
    () => ({ ...query, data: query.data?.pages.flatMap(page => page) as TResponse | undefined }),
    [query]
  );

  return res;
};
