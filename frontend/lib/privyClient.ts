import { PrivyClient } from "@privy-io/server-auth";

if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_SECRET) throw new Error("PRIVY_APP_ID or PRIVY_SECRET is not set");

const globalForPrivy = global as unknown as { privyClient: PrivyClient };

export const privyClient =
  globalForPrivy.privyClient || new PrivyClient(process.env.PRIVY_APP_ID, process.env.PRIVY_SECRET);

export default privyClient;
