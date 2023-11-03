import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";

export function useServerActionMutation<TParams, TResponse>(
  mutationFn: (params: TParams, options: ServerActionOptions) => Promise<ServerActionResponse<TResponse>>
) {
  const { getAccessToken } = usePrivy();

  const wrappedMutationFn = async (params: TParams) => {
    const token = await getAccessToken();
    const res = await mutationFn(params, { authorization: token || undefined });
    if (res.error) throw new Error(res.error);
    else return res.data;
  };

  return useMutation((params: TParams) => wrappedMutationFn(params));
}
