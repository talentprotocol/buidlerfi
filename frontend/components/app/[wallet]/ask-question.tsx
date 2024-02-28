import { getTags } from "@/backend/tags/tags";
import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { usePostOpenQuestion, usePostQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import Button from "@mui/joy/Button";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Typography from "@mui/joy/Typography";
import { RecommendedUser } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const AskQuestion = () => {
  const { user } = useUserContext();
  const router = useBetterRouter();
  const { wallet } = router.searchParams;
  const [tag, setTag] = useState<string | null>(null);
  const profile = useUserProfile(wallet as `0x${string}`);
  const [questionContent, setQuestionContent] = useState("");
  const [showBadQuestionLabel, setShowBadQuestionLabel] = useState(false);
  const postQuestion = usePostQuestion();
  const postOpenQuestion = usePostOpenQuestion();
  const isOpenQuestion = !wallet;
  const { data: tags } = useQuery(["tags"], () => getTags(), { select: data => data.data });

  const sendQuestion = async () => {
    if (!questionContent.includes("?")) {
      setShowBadQuestionLabel(true);
      return;
    } else {
      setShowBadQuestionLabel(false);
    }

    if (!isOpenQuestion && (profile.user?.id || profile.recommendedUser?.farcaster)) {
      await postQuestion
        .mutateAsync({
          questionContent: questionContent,
          replierId: profile.user?.id as number,
          recommendedUser: profile.recommendedUser as RecommendedUser
        })
        .then(res => router.replace(`/question/${res?.id}`));
    } else {
      await postOpenQuestion
        .mutateAsync({
          questionContent: questionContent,
          tag: tag || ""
        })
        .then(res => router.replace(`/question/${res?.id}`));
    }
  };

  return (
    <>
      <InjectTopBar
        withBack
        title="Ask a question"
        endItem={
          <Button
            loading={postQuestion.isLoading || postOpenQuestion.isLoading}
            disabled={questionContent.length < MIN_QUESTION_LENGTH || questionContent.length > MAX_QUESTION_LENGTH}
            onClick={sendQuestion}
          >
            Ask
          </Button>
        }
      />
      <Flex y gap2 p={2} grow>
        <Flex x xsb yc>
          <Typography level="title-sm">
            Ask{" "}
            {isOpenQuestion
              ? "an open question"
              : profile.user?.displayName || shortAddress(profile.user?.wallet) || profile.recommendedUser?.farcaster}
          </Typography>
          {isOpenQuestion && (
            <Select
              placeholder="Select a topic"
              size="sm"
              value={tag}
              sx={{ minWidth: "150px" }}
              onChange={(e, newVal) => setTag(newVal === "none" ? null : newVal)}
            >
              <Option value={"none"}>None</Option>
              {(tags || []).map(tag => (
                <Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          )}
        </Flex>
        <FullTextArea
          placeholder={`Ask a question...`}
          avatarUrl={user?.avatarUrl || undefined}
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
    </>
  );
};
