import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { usePrivy } from "@privy-io/react-auth";
import { QueryKey, useQuery } from "@tanstack/react-query";

export const useQuerySA = <TResponse, TQueryKey extends QueryKey = QueryKey>(
  key: TQueryKey,
  queryFn: (options: ServerActionOptions) => Promise<ServerActionResponse<TResponse>>,
  options?: { enabled?: boolean; onSuccess?: (data: TResponse) => void }
) => {
  const { getAccessToken } = usePrivy();
  return useQuery(
    key,
    async () => {
      if (process.env.NODE_ENV === "development") console.log("Request Log - Start: ", key);
      const token = await getAccessToken();
      const res = await queryFn({ authorization: token });
      if (process.env.NODE_ENV === "development") console.log("Request Log - End: ", res);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    options
  );
};
