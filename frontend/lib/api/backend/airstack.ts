import { fetchQuery, init } from "@airstack/node";

if (!process.env.AIRSTACK_TOKEN) throw new Error("AIRSTACK_TOKEN is not set in environment variables");

init(process.env.AIRSTACK_TOKEN);

const getWalletSocialsQuery = `query GetWallet($identity: Identity!) {
  Wallet(input: {identity: $identity, blockchain: ethereum}) {
    primaryDomain {
      name
    }
    domains {
      name
    }
    socials {
      dappName
      profileName
      profileImage
      followerCount
      followingCount
      profileBio
    }
    xmtp {
      isXMTPEnabled
    }
  }
}
`;

export interface AirstackSocialProfiles {
  primaryDomain?: {
    name: string;
  };
  domains?: {
    name: string;
  }[];
  socials?: {
    dappName: string;
    profileName: string;
    profileImage: string;
    followerCount: number;
    followingCount: number;
    profileBio: string;
  }[];
  xmtp?: {
    isXMTPEnabled: boolean;
  };
}

export const getAirstackSocialData = async (address: string) => {
  const res = await fetchQuery(getWalletSocialsQuery, { identity: address });
  return res.data.Wallet as AirstackSocialProfiles;
};
