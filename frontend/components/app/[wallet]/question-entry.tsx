import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useGetHotQuestions, useGetKeyQuestions, useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { getDifference, shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { Avatar, AvatarGroup, Box, Chip, Typography } from "@mui/joy";
import { FC, useMemo } from "react";
import { QuestionContextMenu } from "./question-context-menu";

interface Props {
  question?:
    | NonNullable<ReturnType<typeof useGetQuestionsFromUser>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetKeyQuestions>["data"]>[number];
  onClick: () => void;
  type: "profile" | "home";
  refetch?: () => Promise<unknown>;
}
export const QuestionEntry: FC<Props> = ({ question, onClick, type, refetch }) => {
  const askedOn = useMemo(() => getDifference(question?.createdAt), [question?.createdAt]);
  const router = useBetterRouter();

  const content = useMarkdown(question?.questionContent);

  if (!question) return <></>;

  return (
    <Flex y gap1 p={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x ys gap1>
        <AvatarGroup>
          <Avatar
            sx={{ width: "24px", height: "24px", cursor: "pointer" }}
            src={question.questioner?.avatarUrl || ""}
            onClick={() => router.push(`/profile/${question.questioner.wallet}`)}
          />
          {type === "home" && (
            <Avatar
              sx={{ width: "24px", height: "24px", cursor: "pointer" }}
              src={question.replier?.avatarUrl || ""}
              onClick={() => router.push(`/profile/${question.replier?.wallet}`)}
            />
          )}
        </AvatarGroup>
        <Flex y basis="100%">
          <Flex x xsb ys>
            <Flex x ys gap={0.5}>
              {type === "profile" ? (
                <Typography
                  level="title-sm"
                  whiteSpace="pre-line"
                  textColor="neutral.800"
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/profile/${question.questioner?.wallet}`)}
                >
                  {question.questioner?.displayName}
                </Typography>
              ) : (
                <Typography level="body-sm" textColor="neutral.800">
                  <strong
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${question.questioner?.wallet}`)}
                  >
                    {question.questioner?.displayName || shortAddress(question.questioner?.wallet)}
                  </strong>{" "}
                  asked{" "}
                  <strong
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${question.replier?.wallet}`)}
                  >
                    {question.replier?.displayName || shortAddress(question.questioner?.wallet)}
                  </strong>
                </Typography>
              )}

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
              onClick();
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
          onClick();
        }}
      >
        <Reactions sx={{ ml: 4 }} questionId={question.id} /> <Flex />
        {!question.repliedOn ? (
          <Chip size="sm" color="neutral" variant="outlined">
            Awaiting answer
          </Chip>
        ) : (
          <Chip size="sm" color="primary" variant="outlined">
            Answered
          </Chip>
        )}
      </Flex>
    </Flex>
  );
};
