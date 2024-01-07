import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useEditQuestion, useGetQuestion, usePostQuestion } from "@/hooks/useQuestionsApi";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import { Button, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  questionToEdit?: number;
  close: () => void;
  refetch: () => Promise<unknown>;
  ownerUser?: {
    displayName: string | null;
    id: number;
  };
}

export const AskQuestionModal: FC<Props> = ({ close, refetch, questionToEdit, ownerUser }) => {
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
    },
    cacheTime: 0,
    staleTime: 0
  });

  const isEditMode = questionToEdit !== undefined;

  const sendQuestion = async () => {
    if (!ownerUser) {
      toast.error("Not ready yet");
      return;
    }

    if (!questionContent.includes("?")) {
      setShowBadQuestionLabel(true);
      return;
    } else {
      setShowBadQuestionLabel(false);
    }

    if (isEditMode) {
      await editQuestion
        .mutateAsync({
          questionId: questionToEdit,
          questionContent: questionContent
        })
        .then(() => {
          refetch();
          close();
        });
    } else {
      await postQuestion.mutateAsync({
        questionContent: questionContent,
        replierId: ownerUser.id
      });
      refetch();
      close();
    }
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
            <Typography level="title-sm">Ask to {ownerUser?.displayName}</Typography>
            <Button
              loading={postQuestion.isLoading}
              disabled={questionContent.length < MIN_QUESTION_LENGTH || questionContent.length > MAX_QUESTION_LENGTH}
              onClick={sendQuestion}
            >
              {isEditMode ? "Edit" : "Ask"}
            </Button>
          </Flex>
          <FullTextArea
            placeholder={`Ask ${ownerUser?.displayName} a question...`}
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
