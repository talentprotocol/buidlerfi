import { ERRORS } from "@/lib/errors";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";
import { SocialProfileType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";


export async function GET(req: NextRequest) {
  try {
    const castHash = req.headers.get("castHash");
    if (!castHash) {
        return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

    const { result } = await client.fetchAllCastsInThread(castHash);

    // retrieve the casts from the result
    const casts = result?.casts ?? [];

    // Fetch Farcaster profiles
    const authorsFids = [...new Set(casts.map(cast => Number(cast.author.fid)))];
    const farcasterProfiles = await client.fetchBulkUsers(authorsFids, { viewerFid: BUILDERFI_FARCASTER_FID });
    const fidToUsernameMap = new Map(farcasterProfiles.users.map(user => [user.fid, user.username]));

    // Find Builderfi accounts by Farcaster profileName and map FID to UserID
    const authorsWithBuilderfiAccount = await prisma.socialProfile.findMany({
      where: {
        type: SocialProfileType.FARCASTER,
        profileName: { in: Array.from(fidToUsernameMap.values()) }
      },
      include: {
        user: true
      }
    });

    // Create a map from profileName to UserId
    const profileNameToUserIdMap = new Map(authorsWithBuilderfiAccount.map(profile => [profile.profileName, profile.userId]));

    // Filter casts by authors with a Builderfi account
    const builderfiAuthorsCasts = casts.filter(cast => {
      const username = fidToUsernameMap.get(Number(cast.author.fid));
      return username && profileNameToUserIdMap.has(username);
    });
    
    // save on db ....
   

    return NextResponse.json({ /*savedCasts*/ }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
