import { fetchQuery } from "@airstack/airstack-react";

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
    }
    xmtp {
      isXMTPEnabled
    }
  }
}
`;

interface GetWalletSocialsResponse {
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
  }[];
  xmtp?: {
    isXMTPEnabled: boolean;
  };
}

export const getWalletSocials = async (address: `0x${string}`) => {
  const res = await fetchQuery(getWalletSocialsQuery, { identity: address });
  return res.data.Wallet as GetWalletSocialsResponse;
};

const getSocialFollowersQuery = `query GetSocial($identity: Identity!) {
  SocialFollowers(input: {filter: {identity: {_eq: $identity}}, blockchain: ALL}) {
    Follower {
      dappName
      dappSlug
      followerAddress {
        identity
        domains {
          isPrimary
          name
        }
      }
    }
  }
}
`;

interface GetSocialFollowersResponse {
  Follower: {
    dappName: string;
    dappSlug: string;
    followerAddress: {
      identity: string;
      domains: {
        isPrimary: boolean;
        name: string;
      }[];
    };
  }[];
}

export const getSocialFollowers = async (address: `0x${string}`) => {
  const res = await fetchQuery(getSocialFollowersQuery, { identity: address });
  return res.data.SocialFollowers as GetSocialFollowersResponse;
};
