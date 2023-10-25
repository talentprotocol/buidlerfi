import { getAirstackSocialData } from "@/lib/api/backend/airstack";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const res = await getAirstackSocialData(searchParams.get("address") as `0x${string}`);
  return Response.json({ data: res });
};
