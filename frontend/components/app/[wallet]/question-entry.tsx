import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { useProfileContext } from "@/contexts/profileContext";
import { useDateDifferenceFromNow } from "@/hooks/useDateDifference";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { FileUpload } from "@mui/icons-material";
import { Avatar, Chip, IconButton, Typography } from "@mui/joy";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { toast } from "react-toastify";

interface Props {
  question?: NonNullable<ReturnType<typeof useGetQuestions>["data"]>[0];
  isOwnChat: boolean;
  socialData: SocialData;
  refetch: () => void;
  index: string;
  ownsKeys: boolean;
  onClick: () => void;
}
export const QuestionEntry: FC<Props> = ({ question, refetch, index, onClick }) => {
  const { hasKeys } = useProfileContext();
  const askedOn = useDateDifferenceFromNow(question?.createdAt || undefined);
  const pathname = usePathname();

  if (!question) return <></>;

  return (
    <Flex y gap2 p={2} borderBottom={"1px solid " + theme.palette.divider} onClick={onClick} pointer>
      <Flex x xsb>
        <Flex x ys gap1>
          <Avatar
            size="sm"
            sx={{ cursor: "pointer" }}
            src={question.questioner?.avatarUrl || DEFAULT_PROFILE_PICTURE}
          />
          <Flex y key={question.id}>
            <Flex x yc gap={0.5}>
              <Typography level="title-sm" whiteSpace="pre-line" sx={{ cursor: "pointer" }}>
                {question.questioner.displayName || shortAddress(question.questioner.wallet as `0x${string}`)}
              </Typography>
              <Typography level="body-sm">•</Typography>
              <Typography level="body-sm">{askedOn}</Typography>
              {!question.reply && (
                <Chip size="sm" color="neutral" variant="outlined">
                  Waiting answer
                </Chip>
              )}
            </Flex>
            <Typography fontWeight={400} level="body-sm" whiteSpace="pre-line" textTransform={"none"}>
              {question.questionContent}
            </Typography>
          </Flex>
        </Flex>
        <Typography level="body-sm">{index}</Typography>
      </Flex>
      <Flex x yc xsb grow>
        {hasKeys ? <Reactions sx={{ ml: 4 }} question={question} refetch={refetch} /> : <Flex />}
        <IconButton
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(location.origin + pathname + `?question=${question.id}`);
            toast.success("Copied share link to clipboard");
          }}
        >
          <FileUpload fontSize="small" />
        </IconButton>
      </Flex>
    </Flex>
  );
};
