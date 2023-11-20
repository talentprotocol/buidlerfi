import { Flex } from "@/components/shared/flex";
import { GetQuestionsResponse, usePutQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { KeyboardArrowDown, KeyboardArrowUp, LockOutlined } from "@mui/icons-material";
import { Avatar, Button, Textarea, Typography } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { FC, useLayoutEffect, useRef, useState } from "react";

interface Props {
  question: GetQuestionsResponse;
  isOwnChat: boolean;
  socialData: SocialData;
  refetch: () => void;
  index: string;
  ownsKeys: boolean;
}
export const QuestionEntry: FC<Props> = ({ question, isOwnChat, refetch, socialData, index, ownsKeys }) => {
  const answerRef = useRef<HTMLDivElement>(null);
  const [isAnswerTooLong, setIsAnswerTooLong] = useState(false);
  const [reply, setReply] = useState("");
  const [isShowMore, setIsShowMore] = useState(false);
  const putQuestion = usePutQuestion();
  const router = useRouter();

  const replyQuestion = async () => {
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    refetch();
  };

  useLayoutEffect(() => {
    if (!answerRef.current) return;
    if (answerRef.current.clientWidth < answerRef.current.scrollWidth) {
      setIsAnswerTooLong(true);
    }
  }, [answerRef]);

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const contentForAnswer = () => {
    if (ownsKeys) {
      return question.reply || "Waiting for answer";
    } else if (question.repliedOn) {
      return "Hold a key so you are notified when an answer is given";
    } else {
      return "Hold at least one key to access the answers";
    }
  };

  return (
    <Flex y gap2 p={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x xsb>
        <Flex x ys gap1>
          <Avatar
            size="sm"
            sx={{ cursor: "pointer" }}
            src={question.questioner?.avatarUrl || DEFAULT_PROFILE_PICTURE}
            onClick={() => router.push("/profile/" + question.questioner.wallet)}
          />
          <Flex y key={question.id}>
            <Flex x yc gap1>
              <Typography
                fontWeight={500}
                level="body-sm"
                whiteSpace="pre-line"
                textColor={"neutral.800"}
                sx={{ cursor: "pointer" }}
                onClick={() => router.push("/profile/" + question.questioner.wallet)}
              >
                {question.questioner.displayName || shortAddress(question.questioner.wallet as `0x${string}`)}
              </Typography>
              <Typography level="body-sm">{format(question.createdAt, "MMM dd,yyyy")}</Typography>
            </Flex>
            <Typography
              fontWeight={300}
              level="body-sm"
              whiteSpace="pre-line"
              textColor={"neutral.800"}
              textTransform={"none"}
            >
              {question.questionContent}
            </Typography>
          </Flex>
        </Flex>
        <Typography level="body-sm">{index}</Typography>
      </Flex>
      <Flex x ys gap1>
        {ownsKeys ? (
          <Avatar
            size="sm"
            src={socialData.avatar || DEFAULT_PROFILE_PICTURE}
            sx={{ cursor: "pointer" }}
            onClick={() => router.push("/profile/" + socialData.address)}
          />
        ) : (
          <LockOutlined />
        )}
        {question.reply || !isOwnChat ? (
          <Flex y sx={{ overflow: "hidden" }}>
            {ownsKeys && (
              <Typography
                fontWeight={500}
                level="body-sm"
                whiteSpace="pre-line"
                textColor={"neutral.800"}
                sx={{ cursor: "pointer" }}
                onClick={() => router.push("profile/" + question.questioner.wallet)}
              >
                {socialData.name || shortAddress(socialData.address as `0x${string}`)}{" "}
              </Typography>
            )}
            <Typography
              ref={answerRef}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: isShowMore ? "pre-line" : "nowrap"
              }}
              textColor={question.reply ? "neutral.800" : "neutral.400"}
              level="body-sm"
            >
              {contentForAnswer()}
            </Typography>
            {isAnswerTooLong && ownsKeys && (
              <Button
                size="sm"
                variant="plain"
                onClick={() => setIsShowMore(curr => !curr)}
                startDecorator={isShowMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                className="mt-2"
              >
                {isShowMore ? "Show less" : "Show more"}
              </Button>
            )}
          </Flex>
        ) : (
          <Flex y={isSm} yc gap2 width={"100%"}>
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
