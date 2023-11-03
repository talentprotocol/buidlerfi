import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { usePrivy } from "@privy-io/react-auth";
import { QueryKey, useQuery } from "@tanstack/react-query";

export function useServerActionQuery<TQueryKey extends QueryKey = QueryKey, TQueryFnData = unknown>(
  queryKey: TQueryKey,
  queryFn: (options: ServerActionOptions) => Promise<ServerActionResponse<TQueryFnData>>,
  options?: { enabled?: boolean }
) {
  const { getAccessToken } = usePrivy();

  const wrappedQueryFn = async () => {
    const token = await getAccessToken();
    const res = await queryFn({ authorization: token || undefined });
    if (res.error) {
      console.error(res.error);
      throw new Error(res.error);
    } else return res.data;
  };

  return useQuery(queryKey, () => wrappedQueryFn(), options);
}
