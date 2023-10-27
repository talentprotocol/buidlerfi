import { updateUserSocialProfiles } from "@/lib/api/backend/user";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { generateRandomString } from "@/lib/utils";
import { User } from "@privy-io/react-auth";

//Signup
export async function POST(req: Request) {
  try {
    const { privyUser, inviteCode }: { privyUser: User; inviteCode: string } = await req.json();
    if (!privyUser || !privyUser.id || !privyUser.wallet) {
      return Response.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }

    const address = privyUser.wallet.address.toLowerCase();

    const existingCode = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (!existingCode) {
      return Response.json({ error: ERRORS.INVALID_INVITE_CODE }, { status: 400 });
    }

    if (existingCode.used >= existingCode.maxUses) {
      return Response.json({ error: ERRORS.CODE_ALREADY_USED }, { status: 400 });
    }

    const newUser = await prisma.$transaction(async tx => {
      //If user has been created previously (from contract interactions) but hasn't signed up yet
      const existingWallet = await tx.user.findUnique({ where: { wallet: address } });
      const newUser = existingWallet
        ? await tx.user.update({
            where: { wallet: address },
            data: {
              privyUserId: privyUser.id,
              isActive: true
            }
          })
        : await tx.user.create({
            data: {
              privyUserId: privyUser.id,
              wallet: address,
              isActive: true
            }
          });

      const tryGenerateUniqueCode = async (): Promise<string> => {
        const code = generateRandomString(8);
        const existing = await tx.inviteCode.findUnique({ where: { code } });
        if (existing) {
          return await tryGenerateUniqueCode();
        }
        return "bf-" + code;
      };

      //Generate 3 invite codes
      await Promise.all(
        [0, 0, 0].map(async () => {
          const code = await tryGenerateUniqueCode();

          return await tx.inviteCode.create({
            data: {
              code: code,
              userId: newUser.id,
              used: 0,
              maxUses: 1
            }
          });
        })
      );

      await tx.inviteCode.update({
        where: { id: existingCode.id },
        data: {
          used: existingCode.used + 1
        }
      });

      return newUser;
    });

    try {
      await updateUserSocialProfiles(newUser);
    } catch (err) {
      console.error("Error while updating social profiles: ", err);
    }

    return Response.json({ data: newUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
