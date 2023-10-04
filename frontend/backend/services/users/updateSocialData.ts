import prisma from "@/lib/prisma";
import TalentProtocolClient from "@/lib/talentProtocol/client";
import UpsertUser from "./upsert";

// Private
const getTalentProtocolData = async (wallet: string) => {
  try {
    const response = await TalentProtocolClient.getTalent(wallet);
    const data = response.data;
    console.log("Talent Response", data);
    return {
      username: data.talent.username,
      name: data.talent.name,
      headline: data.talent.headline
    };
  } catch (error) {
    console.log("Talent Response error", error);
    return;
  }
};

// Public

interface SocialDataToFetch {
  talentProtocol: boolean;
  ens: boolean;
  farcaster: boolean;
}

const call = async (wallet: string, params: SocialDataToFetch) => {
  const walletLowerCase = wallet.toLowerCase();
  await UpsertUser.call(wallet);

  if (params.talentProtocol) {
    const data = await getTalentProtocolData(wallet);

    if (data) {
      await prisma.userSocialData.upsert({
        where: {
          userWallet: walletLowerCase
        },
        update: {
          talentProtocolData: data
        },
        create: {
          userWallet: walletLowerCase,
          talentProtocolData: data
        }
      });
    }
  }
  if (params.ens) {
    // TODO: Get Ens data
  }
  if (params.farcaster) {
    // TODO: Get Farcaster data
  }

  return await prisma.user.findUnique({
    where: {
      wallet: walletLowerCase
    },
    include: {
      userSocialData: true
    }
  });
};

const UpdateSocialData = {
  call
};

export default UpdateSocialData;
