import { User } from "@privy-io/react-auth";

export interface SimpleUseQueryOptions {
  enabled: boolean;
}

//Helper to prevent conflicts between Prisma User and PrivyUser during autocomplete
export type privyUser = User;
