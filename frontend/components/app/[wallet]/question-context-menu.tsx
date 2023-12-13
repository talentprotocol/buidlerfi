import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useDeleteQuestion, useGetHotQuestions, useGetQuestion, useGetQuestions } from "@/hooks/useQuestionsApi";
import { DeleteOutline, EditOutlined, FileUploadOutlined, MoreHoriz } from "@mui/icons-material";
import { CircularProgress, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { AskQuestionModal } from "./ask-question-modal";

interface Props {
  question:
    | NonNullable<ReturnType<typeof useGetQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetQuestion>["data"]>
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number];
  refetch: () => Promise<unknown>;
}

export const QuestionContextMenu: FC<Props> = ({ question, refetch }) => {
  const { user } = useUserContext();
  const deleteQuestion = useDeleteQuestion();
  const isEditable = question.questioner.id === user?.id && !question.repliedOn;
  const [isEditQuestion, setIsEditQuestion] = useState(false);

  const handleDelete = async () => {
    OpenDialog({
      type: "confirm",
      submit: () => deleteQuestion.mutateAsync(question.id).then(() => refetch()),
      body: "Are you sure you want to delete this question ?",
      title: "Delete question"
    });
  };

  const handleShare = async () => {
    navigator.clipboard.writeText(location.origin + `/question/${question.id}`);
    toast.success("question url copied to clipboard");
  };

  return (
    <>
      {isEditQuestion && (
        <AskQuestionModal questionToEdit={question.id} refetch={refetch} close={() => setIsEditQuestion(false)} />
      )}
      <Dropdown>
        <MenuButton variant="plain">
          <MoreHoriz />
        </MenuButton>
        <Menu>
          {isEditable && (
            <MenuItem onClick={() => setIsEditQuestion(true)}>
              <ListItemDecorator>
                <EditOutlined />
              </ListItemDecorator>
              Edit
            </MenuItem>
          )}
          <MenuItem onClick={handleShare}>
            <ListItemDecorator>
              <FileUploadOutlined />
            </ListItemDecorator>
            Share
          </MenuItem>
          {isEditable && (
            <MenuItem disabled={deleteQuestion.isLoading} color="danger" onClick={handleDelete}>
              <ListItemDecorator>
                {deleteQuestion.isLoading ? <CircularProgress /> : <DeleteOutline />}
              </ListItemDecorator>
              Delete
            </MenuItem>
          )}
        </Menu>
      </Dropdown>
    </>
  );
};
