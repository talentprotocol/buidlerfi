import { AddCommentButton } from "@/components/shared/add-comment-button";
import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useGetQuestion } from "@/hooks/useQuestionsApi";
import { useGetUserStats } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import format from "date-fns/format";
import { FC } from "react";
import { toast } from "react-toastify";

interface Props {
  question: NonNullable<ReturnType<typeof useGetQuestion>["data"]>;
  refetch: () => Promise<unknown>;
  profile: ReturnType<typeof useUserProfile>;
}

export const QuestionContent: FC<Props> = ({ question, profile }) => {
  const { data: questionerStats } = useGetUserStats(question?.questioner?.id);
  const questionContent = useMarkdown(question?.questionContent);
  return (
    <Flex y p={2} gap1>
      <Flex x yc xsb>
        <UnifiedUserItem
          nonClickable
          sx={{ px: 0, py: 0, flexGrow: 1 }}
          user={question.questioner}
          nameLevel="title-sm"
          holdersAndReplies={{
            numberOfHolders: questionerStats?.numberOfHolders || 0,
            questionsCount: questionerStats?.answersCount || 0
          }}
        />
      </Flex>
      {questionContent}
      <Typography level="helper">{format(question.createdAt, "MMM dd, yyyy")}</Typography>
      <Flex x yc xsb>
        <Flex x yc gap3>
          <Reactions questionId={question.id} />
          {question.repliedOn && (profile.hasKeys || !profile.hasLaunchedKeys) && (
            <AddCommentButton questionId={question?.id} count={question._count.comments} />
          )}
        </Flex>
        <IconButton
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title: `${question.questioner.displayName} asked a question to ${question?.replier?.displayName}`,
                text: `Get ${question?.replier?.displayName}’s keys on builder.fi to unlock their answer to this question !`,
                url: `${location.origin}/question/${question.id}`
              });
            } else {
              navigator.clipboard.writeText(location.origin + `/question/${question.id}`);
              toast.success("question url copied to clipboard");
            }
          }}
        >
          <FileUploadOutlined fontSize="small" />
        </IconButton>
      </Flex>
    </Flex>
  );
};
