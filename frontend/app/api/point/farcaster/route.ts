import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { SocialProfileType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const {castHash} = await req.json();
    if (!castHash) {
      return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }
    // Initialize the Neynar API client
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

    // Fetch all casts in the thread starting from a parent cast hash
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
    const profileNameToUserIdMap = new Map(
      authorsWithBuilderfiAccount.map(profile => [profile.profileName, profile.userId])
    );

    // Filter casts by authors with a Builderfi account
    const builderfiAuthorsCasts = casts.filter(cast => {
      const username = fidToUsernameMap.get(Number(cast.author.fid));
      return username && profileNameToUserIdMap.has(username);
    });

    // Prepare the data for saving to the database
    const castInteractionData = builderfiAuthorsCasts.map(cast => {
      const authorUsername = fidToUsernameMap.get(Number(cast.author.fid)) || 'default';
      const userId = profileNameToUserIdMap.get(authorUsername!) || 0;

      return {
        parentCastHash: castHash, // The original cast hash from the request
        replyCastHash: cast.hash, 
        replyCastText: cast.text,
        authorFid: Number(cast.author.fid),
        authorName: authorUsername,
        userId: userId
      };
    });

    // Save the cast interactions to the database
    const savedInteractions = await prisma.castInteraction.createMany({
      data: castInteractionData,
      skipDuplicates: true // To avoid inserting duplicates
    });

    // Return the saved interactions in the response
    return NextResponse.json({ savedInteractions }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}