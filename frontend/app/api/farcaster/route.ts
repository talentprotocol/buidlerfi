import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions as CastWithInteractionsV1 } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { CastWithInteractions as CastWithInteractionsV2 } from "@neynar/nodejs-sdk/build/neynar-api/v2";

export const GET = async () => {
  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);
  const { result } = await client.fetchMentionAndReplyNotifications(BUILDERFI_FARCASTER_FID, {
    limit: 150
  });
  // TODO: fetch publishedBefore from the last time we checked (stored in a db)
  const publishedBefore = Date.now() - 1000 * 120; // 2 minutes
  const mentionNotifications = result.notifications
    ?.filter(
      n =>
        // notifications that are mentions
        n.type === "cast-mention" &&
        // notifications that have been published after the last time we checked
        parseInt(n.timestamp, 10) > publishedBefore &&
        // notifications that have only one mention (the recipient of the question)
        n.mentionedProfiles?.filter(p => p.fid !== BUILDERFI_FARCASTER_FID)?.length === 1
    )
    .map(n => parseMentionNotification(n as unknown as CastWithInteractionsV2));

  const questions = await getQuestionsFromNotifications(mentionNotifications);

  // TODO: create questions on DB
  
  const mostRecentTimestamp = mentionNotifications[0].timestamp;
  // TODO: store mostRecentTimestamp on DB
};

export interface ParsedMentionNotification {
  authorUsername: string;
  authorFid: number;
  mentionedProfiles: { username: string; fid: number }[];
  timestamp: string;
  text: string;
}

const getQuestionsFromNotifications = async (
  notifications: ParsedMentionNotification[]
): { recipientUsername: string; questionContent: string }[] => {
  // TODO: integrate with OpenAI here
};

const parseMentionNotification = (notification: CastWithInteractionsV2) => ({
  authorUsername: notification.author.username,
  authorFid: notification.author.fid,
  mentionedProfiles: (notification as unknown as CastWithInteractionsV1).mentionedProfiles?.map(profile => ({
    username: profile.username,
    fid: profile.fid
  })),
  timestamp: notification.timestamp,
  text: notification.text
});
