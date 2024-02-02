import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { UserName } from "@/components/shared/user-name";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetCommentsCount } from "@/hooks/useCommentApi";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useGetHotQuestions, useGetKeyQuestions, useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { getDifference } from "@/lib/utils";
import theme from "@/theme";
import { Avatar, AvatarGroup, Box, Chip, Typography } from "@mui/joy";
import { FC, useMemo } from "react";
import { QuestionContextMenu } from "./question-context-menu";
import { useTopic } from "@/hooks/useTopicsAPI";

const pluralize = (amount: number) => {
  return amount <= 1 ? "answer" : `answers`;
};

interface Props {
  question?:
    | NonNullable<ReturnType<typeof useGetQuestionsFromUser>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetKeyQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useTopic>["data"]>["questions"][number];
  refetch?: () => Promise<unknown>;
}
export const QuestionEntry: FC<Props> = ({ question, refetch }) => {
  const askedOn = useMemo(() => getDifference(question?.createdAt), [question?.createdAt]);
  const router = useBetterRouter();
  const askedHimself = question?.replier?.id === question?.questioner.id;
  const content = useMarkdown(question?.questionContent);
  //Only fetch for open questions
  const { data: numberOfReplies } = useGetCommentsCount(question?.id, !question?.replier);

  const isAwaitingAnswer =
    (question?.replier && !question.repliedOn) ||
    (!question?.replier && numberOfReplies !== undefined && numberOfReplies === 0);

  const isOpenQuestion = !question?.replier?.id;

  const handleClick = () => {
    router.push(`/question/${question?.id}`);
  };
  if (!question) return <></>;

  return (
    <Flex y gap1 p={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x ys gap1>
        <AvatarGroup>
          <UserAvatar
            sx={{
              width: "24px",
              height: "24px"
            }}
            user={question.questioner}
          />
          {question.replier?.id ? (
            <UserAvatar sx={{ width: "24px", height: "24px" }} user={question?.replier} />
          ) : (
            <Avatar sx={{ width: "24px", height: "24px" }} src={LOGO_BLUE_BACK} />
          )}
        </AvatarGroup>
        <Flex y basis="100%">
          <Flex x xsb ys>
            <Flex x ys gap={0.5}>
              <Typography level="body-sm" textColor="neutral.800">
                <strong>
                  <UserName user={question.questioner} />
                </strong>
                {isOpenQuestion ? " asked an open question" : askedHimself ? " asked himself" : " asked "}
                {!isOpenQuestion && !askedHimself && (
                  <strong>
                    <UserName user={question.replier || undefined} />
                  </strong>
                )}
              </Typography>
              <Typography level="helper">•</Typography>
              <Typography level="body-sm">{askedOn}</Typography>
            </Flex>
            <QuestionContextMenu question={question} refetch={async () => refetch?.()} />
          </Flex>
          <Box
            sx={{ cursor: "pointer" }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleClick();
            }}
          >
            {content}
          </Box>
        </Flex>
      </Flex>
      <Flex
        x
        yc
        xsb
        grow
        pointer
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
      >
        <Reactions sx={{ ml: 4 }} questionId={question.id} />
        {question.topic ? (
          <Chip variant="outlined" size="sm">
            {question.topic.name}
          </Chip>
        ) : (
          <Flex />
        )}
        {isAwaitingAnswer && (
          <Chip size="sm" color="neutral" variant="outlined">
            Awaiting Answer
          </Chip>
        )}
        {question.replier && question.repliedOn && (
          <Chip size="sm" color="primary" variant="outlined">
            Answered
          </Chip>
        )}
        {!question.replier && numberOfReplies !== undefined && numberOfReplies > 0 && (
          <Chip size="sm" color="primary" variant="outlined">
            {numberOfReplies} {pluralize(numberOfReplies)}
          </Chip>
        )}
      </Flex>
    </Flex>
  );
};
