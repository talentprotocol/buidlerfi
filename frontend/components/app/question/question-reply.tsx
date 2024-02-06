"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUserContext } from "@/contexts/userContext";
import { useGetQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import { HelpOutline } from "@mui/icons-material";
import { Button, IconButton, useTheme } from "@mui/joy";
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
  const theme = useTheme();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <>
      {isInfoModalOpen && <GateAnswerHelpModal close={() => setIsInfoModalOpen(false)} />}
      {!isAuthenticatedAndActive && question.isGated && question.repliedOn && (
        <PageMessage
          title="This answer is gated"
          icon={<UserAvatar size="sm" user={profile.user} />}
          text={`You must hold ${profile.user?.displayName}'s key to access his gated answers`}
        />
      )}
      {question.isGated && !question.reply && question?.repliedOn && isAuthenticatedAndActive && (
        <UnlockAnswer {...{ profile, refetch }} />
      )}

      {!question.repliedOn && !profile.isOwnProfile && (
        <PageMessage
          title="Waiting for answer ..."
          icon={<UserAvatar size="sm" user={profile.user} />}
          text={`Wating for ${profile.user?.displayName} to answer`}
        />
      )}

      {profile.isOwnProfile && !question.repliedOn && (
        <Flex p={2} ys>
          <FullTextArea
            placeholder={`Answer ${question.questioner.displayName || shortAddress(question.questioner.wallet)} ...`}
            avatarUrl={question?.replier?.avatarUrl || undefined}
            onChange={e => setReply(e.target.value)}
            value={reply}
          />
          {hasLaunchedKeys && (
            <>
              <Button
                sx={{ minWidth: "70px" }}
                size="sm"
                variant="outlined"
                onClick={() => setIsGateAnswer(!isGateAnswer)}
                color={isGateAnswer ? "danger" : "success"}
              >
                {isGateAnswer ? "Gated" : "Open"}
              </Button>
              <IconButton sx={{ ml: 0.5 }} size="sm" onClick={() => setIsInfoModalOpen(true)}>
                <HelpOutline fontSize="small" htmlColor={theme.palette.neutral[600]} />
              </IconButton>
            </>
          )}
        </Flex>
      )}

      {question.replier && question.repliedOn && question.reply && profile.user && (
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
