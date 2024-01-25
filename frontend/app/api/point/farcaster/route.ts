import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";

/// This endpoint is used to fetch all casts of an AMA and save them to the database in order to assign points to the users who asked the questions.
/// We don't check if the Farcaster user is a builderFI user because we want to assing points to users who are not registered on builderFI yet but could be in the future.

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

    // Prepare the data for saving to the database
    const castInteractionData = casts.map(cast => {
      const authorUsername = fidToUsernameMap.get(Number(cast.author.fid)) || 'default';

      return {
        parentCastHash: castHash, // The parent cast hash from the request
        replyCastHash: cast.hash, // The hash of the reply cast
        replyCastText: cast.text, // The text of the reply cast
        authorFid: Number(cast.author.fid), // The fid of the reply cast author
        authorName: authorUsername // The Farcaster username of the reply cast author
      };
    });

    // Save the cast interactions to the database
    const savedInteractions = await prisma.castInteraction.createMany({
      data: castInteractionData,
      skipDuplicates: true // Skip duplicates if the cast interaction already exists
    });

    // Return the saved interactions in the response
    return NextResponse.json({ savedInteractions }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}