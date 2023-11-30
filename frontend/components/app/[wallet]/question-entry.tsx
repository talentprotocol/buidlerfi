import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { getDifference, shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { FileUploadOutlined } from "@mui/icons-material";
import { Avatar, Chip, IconButton, Typography } from "@mui/joy";
import anchorme from "anchorme";
import { usePathname } from "next/navigation";
import { FC, useMemo } from "react";
import { toast } from "react-toastify";
import sanitize from "sanitize-html";
import { QuestionContextMenu } from "./question-context-menu";

interface Props {
  question?: NonNullable<ReturnType<typeof useGetQuestions>["data"]>[number];
  isOwnChat: boolean;
  socialData: SocialData;
  refetch: () => void;
  ownsKeys: boolean;
  onClick: () => void;
}
export const QuestionEntry: FC<Props> = ({ question, refetch, onClick }) => {
  const askedOn = useMemo(() => getDifference(question?.createdAt), [question?.createdAt]);

  const pathname = usePathname();

  const sanitizedContent = useMemo(() => sanitize(anchorme(question?.questionContent)), [question?.questionContent]);

  if (!question) return <></>;

  return (
    <Flex y gap2 p={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x ys gap1>
        <Avatar size="sm" sx={{ cursor: "pointer" }} src={question.questioner?.avatarUrl || DEFAULT_PROFILE_PICTURE} />
        <Flex y basis="100%">
          <Flex x xsb yc>
            <Flex x yc gap={0.5}>
              <Typography level="title-sm" whiteSpace="pre-line" sx={{ cursor: "pointer" }}>
                {question.questioner.displayName || shortAddress(question.questioner.wallet as `0x${string}`)}
              </Typography>
              <Typography level="helper">•</Typography>
              <Typography level="body-sm">{askedOn}</Typography>
            </Flex>
            <Flex x yc gap2>
              {!question.repliedOn ? (
                <Chip size="sm" color="neutral" variant="outlined">
                  Awaiting answer
                </Chip>
              ) : (
                <Chip size="sm" color="primary" variant="outlined">
                  Answered
                </Chip>
              )}

              <QuestionContextMenu question={question} />
            </Flex>
          </Flex>
          <Typography
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onClick();
            }}
            style={{ cursor: "pointer" }}
            fontWeight={400}
            level="body-sm"
            whiteSpace="pre-line"
          >
            <span style={{ textTransform: "none" }} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </Typography>
        </Flex>
      </Flex>
      <Flex x yc xsb grow>
        <Reactions sx={{ ml: 4 }} question={question} refetch={refetch} /> <Flex />
        <IconButton
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(location.origin + pathname + `?question=${question.id}`);
            toast.success("question url copied to clipboard");
          }}
        >
          <FileUploadOutlined fontSize="small" />
        </IconButton>
      </Flex>
    </Flex>
  );
};
