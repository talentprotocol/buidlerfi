"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useGetQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import { FC } from "react";
import { ReplyCommentEntry } from "../[wallet]/reply-comment-entry";
import { UnlockAnswer } from "./unlock-answer";
interface Props {
  question: NonNullable<ReturnType<typeof useGetQuestion>["data"]>;
  refetch: () => Promise<unknown>;
  profile: ReturnType<typeof useUserProfile>;
  reply: string;
  setReply: (value: string) => void;
}

export const QuestionReply: FC<Props> = ({ question, profile, refetch, reply, setReply }) => {
  console.log({
    replier: question.replier,
    repliedOn: question.repliedOn,
    reply: question.reply,
    hasKeys: profile.hasKeys,
    hasLanchedKeys: profile.hasLaunchedKeys,
    user: profile.user
  });
  return (
    <>
      {!profile.hasKeys && profile.hasLaunchedKeys && question?.repliedOn && <UnlockAnswer {...{ profile, refetch }} />}

      {!question.repliedOn && !profile.isOwnProfile && (
        <PageMessage
          title="Waiting for answer ..."
          icon={<UserAvatar size="sm" user={profile.user} />}
          text={
            profile.hasKeys || !profile.hasLaunchedKeys
              ? `You will get notified when ${profile.user?.displayName} answers`
              : `Buy a key, and get notified when ${profile.user?.displayName} answers`
          }
        />
      )}

      {profile.isOwnProfile && !question.repliedOn && (
        <Flex p={2}>
          <FullTextArea
            placeholder={`Answer ${question.questioner.displayName || shortAddress(question.questioner.wallet)} ...`}
            avatarUrl={question?.replier?.avatarUrl || undefined}
            onChange={e => setReply(e.target.value)}
            value={reply}
          />
        </Flex>
      )}

      {question.replier &&
        question.repliedOn &&
        question.reply &&
        (profile.hasKeys || !profile.hasLaunchedKeys) &&
        profile.user && (
          <ReplyCommentEntry
            type="reply"
            id={question.id}
            author={profile.user}
            content={question.reply}
            createdAt={question.repliedOn}
            refetch={refetch}
          />
        )}
    </>
  );
};
