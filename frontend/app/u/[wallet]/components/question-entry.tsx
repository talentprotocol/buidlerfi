import { Flex } from "@/components/flex";
import { usePutQuestion } from "@/hooks/useQuestionsApi";
import { Box, Button, Input, Typography } from "@mui/joy";
import { Question } from "@prisma/client";
import { FC, useState } from "react";

interface Props {
  question: Question;
  isOwnChat: boolean;
  refetch: () => void;
}
export const QuestionEntry: FC<Props> = ({ question, isOwnChat, refetch }) => {
  const [reply, setReply] = useState("");
  const putQuestion = usePutQuestion();

  const replyQuestion = async () => {
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    refetch();
  };
  return (
    <Box key={question.id}>
      <Typography fontWeight={500} level="body-md">
        {question.questionContent}
      </Typography>
      {question.answerContent || !isOwnChat ? (
        <Typography textColor="neutral.400" level="body-sm">
          {question.answerContent || "Waiting for answer"}
        </Typography>
      ) : (
        <Flex x gap2>
          <Input
            value={reply}
            onChange={e => setReply(e.target.value)}
            fullWidth
            placeholder="Type your reply here"
            type="text"
          />
          <Button className="appearance-none" loading={putQuestion.isLoading} onClick={() => replyQuestion()}>
            Send reply
          </Button>
        </Flex>
      )}
    </Box>
  );
};
