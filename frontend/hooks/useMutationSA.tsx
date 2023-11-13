import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";

export function useMutationSA<TResponse, TArgs = void>(
  mutationFn: (options: ServerActionOptions, args: TArgs) => Promise<ServerActionResponse<TResponse>>
) {
  const { getAccessToken } = usePrivy();
  return useMutation(async (args: TArgs) => {
    const token = await getAccessToken();
    const res = await mutationFn({ authorization: token }, args);
    if (res.error) throw new Error(res.error);
    return res.data;
  });
}
