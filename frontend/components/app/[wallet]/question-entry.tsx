import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { UserName } from "@/components/shared/user-name";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetCommentsCount } from "@/hooks/useCommentApi";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useGetHotQuestions, useGetKeyQuestions, useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { getDifference } from "@/lib/utils";
import theme from "@/theme";
import AvatarGroup from "@mui/joy/AvatarGroup";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import { FC, useMemo } from "react";
import { QuestionContextMenu } from "./question-context-menu";

const pluralize = (amount: number) => {
  return amount <= 1 ? "answer" : `answers`;
};

interface Props {
  question?:
    | NonNullable<ReturnType<typeof useGetQuestionsFromUser>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetKeyQuestions>["data"]>[number];
  refetch?: () => Promise<unknown>;
}
export const QuestionEntry: FC<Props> = ({ question, refetch }) => {
  const askedOn = useMemo(() => getDifference(question?.createdAt), [question?.createdAt]);
  const router = useBetterRouter();
  const askedHimself = question?.replierId === question?.questionerId;
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
        <AvatarGroup sx={{ width: !question.replier?.id ? "34px" : undefined }}>
          <UserAvatar
            sx={{
              width: "24px",
              height: "24px"
            }}
            user={question.questioner}
          />
          {question.replier?.id && <UserAvatar sx={{ width: "24px", height: "24px" }} user={question?.replier} />}
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
      <Grid
        container
        xs={12}
        sx={{ cursor: "pointer" }}
        mt={1}
        mb={-1}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
      >
        <Grid xs={4} display={"flex"} alignItems={"flex-end"}>
          <Reactions sx={{ ml: 4 }} questionId={question.id} />
        </Grid>
        <Grid xs={4} display={"flex"} alignItems={"center"}>
          {question.tags.length > 0 && (
            <Chip variant="outlined" size="sm">
              {question.tags[0].name}
            </Chip>
          )}
        </Grid>
        <Grid xs={4} display={"flex"} justifyContent={"flex-end"} alignItems={"center"}>
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
        </Grid>
      </Grid>
    </Flex>
  );
};
