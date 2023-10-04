if (!process.env.NEXT_PUBLIC_AIRSTACK_TOKEN)
  throw new Error("NEXT_PUBLIC_AIRSTACK_TOKEN is not set in environment variables");

export const appConfig = {
  publicAirstackToken: process.env.NEXT_PUBLIC_AIRSTACK_TOKEN
} as const;
