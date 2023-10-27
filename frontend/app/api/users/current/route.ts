import { updateUserSocialProfiles } from "@/lib/api/backend/user";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

//Refresh sociasl profiles
export const PUT = async (req: NextRequest) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        privyUserId: req.headers.get("privyUserId")!
      }
    });

    const res = await updateUserSocialProfiles(user!);
    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const res = await prisma.user.findUnique({
      where: {
        privyUserId: req.headers.get("privyUserId")!
      },
      include: {
        inviteCodes: true,
        socialProfiles: true,
        points: true
      }
    });
    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
