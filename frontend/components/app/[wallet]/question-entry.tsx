import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetHotQuestions, useGetQuestions } from "@/hooks/useQuestionsApi";
import { getDifference, shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { Avatar, AvatarGroup, Chip, Typography } from "@mui/joy";
import anchorme from "anchorme";
import { FC, useMemo } from "react";
import sanitize from "sanitize-html";
import { QuestionContextMenu } from "./question-context-menu";

interface Props {
  question?:
    | NonNullable<ReturnType<typeof useGetQuestions>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetHotQuestions>["data"]>[number];
  onClick: () => void;
  type: "profile" | "home";
}
export const QuestionEntry: FC<Props> = ({ question, onClick, type }) => {
  const askedOn = useMemo(() => getDifference(question?.createdAt), [question?.createdAt]);
  const router = useBetterRouter();

  const sanitizedContent = useMemo(() => sanitize(anchorme(question?.questionContent)), [question?.questionContent]);

  if (!question) return <></>;

  return (
    <Flex y gap1 p={2} borderBottom={"1px solid " + theme.palette.divider}>
      <Flex x ys gap1>
        <AvatarGroup>
          <Avatar
            sx={{ width: "24px", height: "24px", cursor: "pointer" }}
            src={question.questioner?.avatarUrl || ""}
            onClick={() => router.push(`/profile/${question.questioner.wallet}`)}
          />
          {type === "home" && (
            <Avatar
              sx={{ width: "24px", height: "24px", cursor: "pointer" }}
              src={question.replier?.avatarUrl || ""}
              onClick={() => router.push(`/profile/${question.replier.wallet}`)}
            />
          )}
        </AvatarGroup>
        <Flex y basis="100%">
          <Flex x xsb ys>
            <Flex x ys gap={0.5}>
              {type === "profile" ? (
                <Typography
                  level="title-sm"
                  whiteSpace="pre-line"
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/profile/${question.questioner.wallet}`)}
                >
                  {question.questioner.displayName}
                </Typography>
              ) : (
                <>
                  <Typography
                    level="title-sm"
                    whiteSpace="pre-line"
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${question.questioner.wallet}`)}
                  >
                    {question.questioner.displayName || shortAddress(question.questioner.wallet)}
                  </Typography>
                  <Typography level="body-sm"> asked </Typography>
                  <Typography
                    level="title-sm"
                    whiteSpace="pre-line"
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${question.replier.wallet}`)}
                  >
                    {question.replier.displayName}
                  </Typography>
                </>
              )}

              <Typography level="helper">•</Typography>
              <Typography level="body-sm">{askedOn}</Typography>
            </Flex>
            <QuestionContextMenu question={question} />
            {/* <Flex x yc gap2>
              

            </Flex> */}
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
      <Flex
        x
        yc
        xsb
        grow
        pointer
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <Reactions sx={{ ml: 4 }} questionId={question.id} /> <Flex />
        {!question.repliedOn ? (
          <Chip size="sm" color="neutral" variant="outlined">
            Awaiting answer
          </Chip>
        ) : (
          <Chip size="sm" color="primary" variant="outlined">
            Answered
          </Chip>
        )}
        {/* <IconButton
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(location.origin + pathname + `?question=${question.id}`);
            toast.success("question url copied to clipboard");
          }}
        >
          <FileUploadOutlined fontSize="small" />
        </IconButton> */}
      </Flex>
    </Flex>
  );
};
