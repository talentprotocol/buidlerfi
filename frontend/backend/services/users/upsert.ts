import prisma from "@/lib/prisma";

const call = async (wallet: string) => {
  return await prisma.user.upsert({
    where: {
      wallet: wallet.toLowerCase()
    },
    update: {},
    create: {
      wallet: wallet.toLowerCase()
    },
    include: {
      userSocialData: true
    }
  });
};

const UpsertUser = {
  call
};

export default UpsertUser;
