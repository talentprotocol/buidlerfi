import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { usePostQuestion } from "@/hooks/useQuestionsApi";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import { Button, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC, useState } from "react";

interface Props {
  close: () => void;
  refetch: () => Promise<unknown>;
}

export const AskQuestionModal: FC<Props> = ({ close, refetch }) => {
  const { user } = useUserContext();
  const { socialData } = useProfileContext();
  const [questionContent, setQuestionContent] = useState("");
  const postQuestion = usePostQuestion();

  const sendQuestion = async () => {
    await postQuestion.mutateAsync({
      questionContent: questionContent,
      replierId: socialData.userId
    });
    await refetch();
    close();
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
            <Typography level="title-sm">Ask to {socialData.displayName}</Typography>
            <Button
              loading={postQuestion.isLoading}
              disabled={questionContent.length < MIN_QUESTION_LENGTH || questionContent.length > MAX_QUESTION_LENGTH}
              onClick={sendQuestion}
            >
              Ask
            </Button>
          </Flex>
          <FullTextArea
            placeholder={`Ask ${socialData.displayName} a question...`}
            avatarUrl={user?.avatarUrl || undefined}
            onChange={e => setQuestionContent(e.target.value)}
            value={questionContent}
          />
        </Flex>
        <Flex x alignSelf={"flex-end"} pb={2} pr={2}>
          <Typography color={questionContent.length > MAX_QUESTION_LENGTH ? "danger" : undefined} level="helper">
            {questionContent.length}/{MAX_QUESTION_LENGTH}
          </Typography>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
