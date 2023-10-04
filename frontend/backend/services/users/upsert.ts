import prisma from "@/lib/prisma";

const call = async (wallet: string) => {
  let user = await prisma.user.findUnique({
    where: {
      wallet: wallet.toLowerCase()
    }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        wallet: wallet.toLowerCase()
      }
    });
  }

  return user;
};

const UpsertUser = {
  call
};

export default UpsertUser;
