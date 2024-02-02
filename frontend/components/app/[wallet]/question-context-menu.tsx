import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useGetCommentsCount } from "@/hooks/useCommentApi";
import {
  useDeleteQuestion,
  useGetHotQuestions,
  useGetQuestion,
  useGetQuestionsFromUser
} from "@/hooks/useQuestionsApi";
import { DeleteOutline, EditOutlined, FileUploadOutlined, MoreHoriz } from "@mui/icons-material";
import { CircularProgress, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC, useState } from "react";
import { toast } from "react-toastify";
import { EditQuestionModal } from "./edit-question-modal";

interface Props {
  question:
    | NonNullable<ReturnType<typeof useGetQuestionsFromUser>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetQuestion>["data"]>
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number];
  refetch: () => Promise<unknown>;
}

export const QuestionContextMenu: FC<Props> = ({ question, refetch }) => {
  const { user } = useUserContext();
  const deleteQuestion = useDeleteQuestion();
  const { data: repliesCount } = useGetCommentsCount(question.id, !question.replier);
  const isEditable =
    question.questioner?.id === user?.id &&
    ((question.replier && !question.repliedOn) || (!question.replier && repliesCount === 0));
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
    if (navigator.share) {
      navigator.share({
        title: question.replier
          ? `${question.questioner.displayName} asked a question to ${question.replier.displayName}`
          : `${question.questioner.displayName} asked an open question`,
        text: `Share your insight about ${question.questioner.displayName}'s question on builder.fi!`,
        url: `${location.origin}/question/${question.id}`
      });
    } else {
      navigator.clipboard.writeText(location.origin + `/question/${question.id}`);
      toast.success("question url copied to clipboard");
    }
  };

  return (
    <>
      {isEditQuestion && (
        <EditQuestionModal questionToEdit={question.id} refetch={refetch} close={() => setIsEditQuestion(false)} />
      )}
      <Dropdown>
        <MenuButton sx={{ minHeight: "0px" }} variant="plain">
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
