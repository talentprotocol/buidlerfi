import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { formatError } from "@/lib/utils";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useMutationSA<TResponse, TArgs = void>(
  mutationFn: (options: ServerActionOptions, args: TArgs) => Promise<ServerActionResponse<TResponse>>,
  options?: SimpleUseQueryOptions<TResponse>
) {
  const { getAccessToken } = usePrivy();
  return useMutation(
    //@ts-expect-error this should work
    async (args: TArgs) => {
      const token = await getAccessToken();
      if (process.env.NODE_ENV === "development") console.log("Request Log (Mutation) - Start: ", args);
      const res = await mutationFn({ authorization: token }, args);
      if (process.env.NODE_ENV === "development") console.log("Request Log (Mutation) - End: ", res);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    {
      enabled: options?.enabled,
      onSuccess: (data: TResponse) => (options?.onSuccess ? options.onSuccess(data) : Promise<void>),
      onError: options?.showError ? (err: unknown) => toast.error(formatError(err)) : undefined,
      refetchOnMount: options?.refetchOnMount,
      cacheTime: options?.cacheTime,
      staleTime: options?.staleTime
    }
  );
}
