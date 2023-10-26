import { Flex } from "@/components/shared/flex";
import { GetQuestionsResponse, usePutQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Avatar, Button, Textarea, Typography } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { format } from "date-fns";
import { FC, useLayoutEffect, useRef, useState } from "react";

interface Props {
  question: GetQuestionsResponse;
  isOwnChat: boolean;
  socialData: SocialData;
  refetch: () => void;
}
export const QuestionEntry: FC<Props> = ({ question, isOwnChat, refetch, socialData }) => {
  const answerRef = useRef<HTMLDivElement>(null);

  const [isAnswerTooLong, setIsAnswerTooLong] = useState(false);
  const [reply, setReply] = useState("");
  const [isShowMore, setIsShowMore] = useState(false);
  const putQuestion = usePutQuestion();

  const replyQuestion = async () => {
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    refetch();
  };

  useLayoutEffect(() => {
    if (answerRef.current && answerRef.current.clientWidth < answerRef.current.scrollWidth) {
      setIsAnswerTooLong(true);
    }
  }, [answerRef]);

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Flex y gap1 pb={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x ys gap1>
        <Avatar src={question.questioner?.avatarUrl || DEFAULT_PROFILE_PICTURE} />
        <Flex y gap1={!question.reply} key={question.id}>
          <Flex x yc gap1>
            <Typography fontWeight={500} level="body-md" whiteSpace="pre-line">
              {question.questioner.displayName || shortAddress(question.questioner.wallet as `0x${string}`)}
            </Typography>
            <Typography level="body-sm">{format(question.createdAt, "MMM dd,yyyy")}</Typography>
          </Flex>
          <Typography fontWeight={300} level="body-md" whiteSpace="pre-line">
            {question.questionContent}
          </Typography>
        </Flex>
      </Flex>
      <Flex x yc gap1>
        <Avatar src={socialData.avatar || DEFAULT_PROFILE_PICTURE} />
        {question.reply || !isOwnChat ? (
          <Flex y gap2>
            <Typography
              ref={answerRef}
              sx={{
                whiteSpace: isShowMore ? "pre-line" : "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
              textColor="neutral.500"
              level="body-sm"
              maxWidth="100%"
            >
              {question.reply || "Waiting for answer"}
            </Typography>
            {isAnswerTooLong && (
              <Button
                size="sm"
                variant="plain"
                onClick={() => setIsShowMore(curr => !curr)}
                startDecorator={isShowMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                sx={{ mb: -1 }}
              >
                {isShowMore ? "Show less" : "Show more"}
              </Button>
            )}
          </Flex>
        ) : (
          <Flex y={isSm} yc gap2>
            <Textarea
              sx={{ flexGrow: 1 }}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your reply here"
            />
            <Button className="appearance-none" loading={putQuestion.isLoading} onClick={() => replyQuestion()}>
              Post answer
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
