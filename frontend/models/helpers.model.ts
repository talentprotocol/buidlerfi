import { User } from "@privy-io/react-auth";

export interface SimpleUseQueryOptions<TResponse = unknown> {
  enabled?: boolean;
  onSuccess?: (data: TResponse) => void;
  refetchOnMount?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

//Helper to prevent conflicts between Prisma User and PrivyUser during autocomplete
export type privyUser = User;
