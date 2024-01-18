import { fetchQuery, init } from "@airstack/node";

if (!process.env.AIRSTACK_TOKEN) throw new Error("AIRSTACK_TOKEN is not set in environment variables");

init(process.env.AIRSTACK_TOKEN);

const getFarcasterFollowingsQuery = `query MyQuery($identity: Identity!) {
    SocialFollowings(
      input: {
        filter: {
          dappName: { _eq: farcaster }
          identity: {
            _eq: $identity
          }
        }
        blockchain: ALL
        limit: 200
      }
    ) {
      Following {
        followingAddress {
          addresses
          socials(input: { filter: { dappName: { _eq: farcaster } } }) {
            profileName
            userId
            userAssociatedAddresses
          }
        }
      }
    }
  }`;

export interface Social {
  profileName: string;
  userId: string;
  userAssociatedAddresses: string[];
}

export interface FollowingAddress {
  addresses: string[];
  socials: Social[];
}

export interface Following {
  followingAddress: FollowingAddress;
}

export interface SocialFollowings {
  Following: Following[];
}

export interface RootObject {
  SocialFollowings: SocialFollowings;
}

export const getAirstackFarcasterFollowings = async (farcasterProfileName: string) => {
  const res = await fetchQuery(getFarcasterFollowingsQuery, { identity: `fc_fname:${farcasterProfileName}` });
  const socialFollowings = res.data.SocialFollowings as SocialFollowings;

  if (!socialFollowings) {
    return [];
  }

  const profileNames = socialFollowings.Following.flatMap(following =>
    following.followingAddress.socials.map(social => social.profileName)
  );

  return profileNames;
};
