import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useEditQuestion, useGetQuestion, usePostQuestion } from "@/hooks/useQuestionsApi";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC, useState } from "react";

interface Props {
  questionToEdit: number;
  close: () => void;
  refetch: () => Promise<unknown>;
}

export const EditQuestionModal: FC<Props> = ({ close, refetch, questionToEdit }) => {
  const { user: currentUser } = useUserContext();
  const [questionContent, setQuestionContent] = useState("");
  const [showBadQuestionLabel, setShowBadQuestionLabel] = useState(false);
  const postQuestion = usePostQuestion();
  const editQuestion = useEditQuestion();

  const {} = useGetQuestion(questionToEdit!, {
    enabled: !!questionToEdit,
    //Need to fix this to add typescript inference
    onSuccess: (data: unknown) => {
      const questionData = data as { questionContent: string };
      setQuestionContent(questionData.questionContent);
    }
  });

  const sendQuestion = async () => {
    if (!questionContent.includes("?")) {
      setShowBadQuestionLabel(true);
      return;
    } else {
      setShowBadQuestionLabel(false);
    }

    await editQuestion
      .mutateAsync({
        questionId: questionToEdit,
        questionContent: questionContent
      })
      .then(async () => {
        await refetch();
        close();
      });
  };

  const handleClose = () => {
    if (questionContent.length > MIN_QUESTION_LENGTH) {
      OpenDialog({
        type: "discard",
        submit: () => close()
      });
    } else {
      close();
    }
  };

  return (
    <Modal open={true} onClose={handleClose}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y gap2 p={2} grow>
          <Flex x xsb yc>
            <Typography level="title-sm">Edit question</Typography>
            <Button
              loading={postQuestion.isLoading}
              disabled={questionContent.length < MIN_QUESTION_LENGTH || questionContent.length > MAX_QUESTION_LENGTH}
              onClick={sendQuestion}
            >
              Edit
            </Button>
          </Flex>
          <FullTextArea
            placeholder={`Edit your question...`}
            avatarUrl={currentUser?.avatarUrl || undefined}
            onChange={e => setQuestionContent(e.target.value)}
            value={questionContent}
          />
        </Flex>
        {showBadQuestionLabel && (
          <Typography color={"danger"} level="helper" paddingLeft={2} paddingRight={2}>
            builder.fi is designed to ask thoughtful questions to other builders. Make sure you&apos;re posting a
            question.
          </Typography>
        )}
        <Flex x alignSelf={"flex-end"} pb={2} pr={2}>
          <Typography color={questionContent.length > MAX_QUESTION_LENGTH ? "danger" : undefined} level="helper">
            {questionContent.length}/{MAX_QUESTION_LENGTH}
          </Typography>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
