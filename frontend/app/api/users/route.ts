import { updateUserSocialProfiles } from "@/lib/api/backend/user";
import prisma from "@/lib/prisma";
import { generateRandomString } from "@/lib/utils";
import { User } from "@privy-io/react-auth";

export async function POST(req: Request) {
  try {
    const { privyUser, inviteCode }: { privyUser: User; inviteCode: string } = await req.json();
    if (!privyUser || !privyUser.id || !privyUser.wallet || !inviteCode) {
      return Response.json({ error: "Incorrect body" }, { status: 400 });
    }

    const address = privyUser.wallet.address.toLowerCase();

    const existingCode = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (!existingCode) {
      return Response.json({ error: "Invalid invite code" }, { status: 400 });
    }

    if (existingCode.used >= existingCode.maxUses) {
      return Response.json({ error: "Invite code has been used too many times" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { privyUserId: privyUser.id, isActive: true } });
    if (existingUser) return Response.json({ data: existingUser }, { status: 200 });

    const newUser = await prisma.$transaction(async tx => {
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
        return code;
      };

      const code = await tryGenerateUniqueCode();

      await tx.inviteCode.create({
        data: {
          code: code,
          userId: newUser.id,
          used: 0,
          maxUses: 10
        }
      });

      await tx.inviteCode.update({
        where: { id: existingCode.id },
        data: {
          used: existingCode.used + 1
        }
      });

      return newUser;
    });

    await updateUserSocialProfiles(newUser);
    return Response.json({ data: newUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
