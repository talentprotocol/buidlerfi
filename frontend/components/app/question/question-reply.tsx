"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUserContext } from "@/contexts/userContext";
import { useGetQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import Checkbox from "@mui/joy/Checkbox";
import { FC, useState } from "react";
import { ReplyCommentEntry } from "../[wallet]/reply-comment-entry";
import { GateAnswerHelpModal } from "./gate-answer-help-modal";
import { UnlockAnswer } from "./unlock-answer";
interface Props {
  question: NonNullable<ReturnType<typeof useGetQuestion>["data"]>;
  refetch: () => Promise<unknown>;
  profile: ReturnType<typeof useUserProfile>;
  reply: string;
  setReply: (value: string) => void;
  isGateAnswer: boolean;
  setIsGateAnswer: (newVal: boolean) => void;
}

export const QuestionReply: FC<Props> = ({
  question,
  profile,
  refetch,
  reply,
  setReply,
  isGateAnswer,
  setIsGateAnswer
}) => {
  const { isAuthenticatedAndActive, hasLaunchedKeys } = useUserContext();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <>
      {isInfoModalOpen && <GateAnswerHelpModal close={() => setIsInfoModalOpen(false)} />}
      {!isAuthenticatedAndActive && question.isGated && question.repliedOn && (
        <PageMessage
          title="This answer is gated"
          icon={<UserAvatar size="sm" user={profile.user} />}
          text={`You must hold ${
            profile.user?.displayName || shortAddress(profile.user?.wallet)
          }'s key to access his gated answers`}
        />
      )}
      {question.isGated && !question.reply && question?.repliedOn && isAuthenticatedAndActive && (
        <UnlockAnswer {...{ profile, refetch }} />
      )}

      {!question.repliedOn && !profile.isOwnProfile && (
        <PageMessage
          title="Waiting for answer ..."
          icon={<UserAvatar size="sm" user={profile.user} />}
          text={`Wating for ${profile.user?.displayName || shortAddress(profile.user?.wallet)} to answer`}
        />
      )}

      {profile.isOwnProfile && !question.repliedOn && (
        <Flex y p={2} gap3>
          <FullTextArea
            placeholder={`Answer ${question.questioner.displayName || shortAddress(question.questioner.wallet)} ...`}
            avatarUrl={question?.replier?.avatarUrl || undefined}
            onChange={e => setReply(e.target.value)}
            value={reply}
          />
          {hasLaunchedKeys && (
            <Checkbox
              label="Gate this answer to be visible to your key holders only."
              size="sm"
              checked={isGateAnswer}
              onChange={e => setIsGateAnswer(e.target.checked)}
            />
          )}
        </Flex>
      )}

      {question.replier &&
        question.repliedOn &&
        //We only need to check if reply exists. Backend will take care of removing it
        //If we don't have the keys. This allows to have a single source of truth
        question.reply &&
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
