import UpdateSocialData from "@/backend/services/users/updateSocialData";

export async function PUT(req: Request, { params }: { params: { wallet: string } }) {
  try {
    const body = await req.json();
    const user = await UpdateSocialData.call(params.wallet, body);

    return Response.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
