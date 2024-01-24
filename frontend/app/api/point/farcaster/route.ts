import { getPointsHistory } from "@/backend/point/point";
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

    // map all the casts to their respective authors fid
    const authorsFids = result?.casts?.map(cast => cast.author.fid);

    // create a Set from authorsFids to remove duplicates and convert it back to an array
    const uniqueAuthorsFids = Array.from(new Set(authorsFids));

    // convert the authorsFids array to an array of numbers
    const authorsFidsNumbers = uniqueAuthorsFids.map(fid => Number(fid));

    // get the Farcaster profile names from their FIDs
    const authors = (await client.fetchBulkUsers(authorsFidsNumbers, { viewerFid: BUILDERFI_FARCASTER_FID })).users;

    // get only the profiles with an account on Builderfi
    // TODO: this is not working
    const authorsWithBuilderfiAccount = authors.filter(author => author.username.includes(SocialProfileType.FARCASTER));

    const authorsWithBuilderfiAccountFids = authorsWithBuilderfiAccount.map(author => author.fid);

    // for all the authors, get their casts 
    const builderfiAuthorsCasts = result.casts.filter(cast => authorsWithBuilderfiAccountFids.includes(Number(cast.author.fid)));


  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
