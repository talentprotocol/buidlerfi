import { updateUserSocialProfiles } from "@/lib/api/backend/user";
import { fetchHolders } from "@/lib/api/common/builderfi";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { wallet: string } }) {
  try {
    const address = params.wallet.toLowerCase();
    const res = await prisma.user.findUnique({
      where: {
        wallet: address
      },
      include: {
        socialProfiles: true
      }
    });
    if (res) return Response.json({ data: res }, { status: 200 });

    //Wallet can be found in graph if user bypassed frontend and made tx directly on the contract.
    // In that case, user will not exist in DB. So we query the graph to see if wallet has any holders.
    // And if he does, we create a new user in DB with active = false
    const holders = await fetchHolders(address);
    if (holders.length <= 0) return Response.json({ error: ERRORS.USER_NOT_FOUND }, { status: 404 });

    const newUser = await prisma.user.create({
      data: {
        wallet: address,
        isActive: false
      }
    });

    const user = await updateUserSocialProfiles(newUser);

    return Response.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
