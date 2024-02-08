import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { usePostOpenQuestion, usePostQuestion } from "@/hooks/useQuestionsApi";
import { useGetTopics } from "@/hooks/useTopicsAPI";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import { Button, Option, Select, Typography } from "@mui/joy";
import { RecommendedUser } from "@prisma/client";
import { useState } from "react";

export const AskQuestion = () => {
  const { user } = useUserContext();
  const router = useBetterRouter();
  const { wallet } = router.searchParams;
  const [topic, setTopic] = useState<string | null>(null);
  const profile = useUserProfile(wallet as `0x${string}`);
  const [questionContent, setQuestionContent] = useState("");
  const [showBadQuestionLabel, setShowBadQuestionLabel] = useState(false);
  const isOpenQuestion = !wallet;
  const { data: topics } = useGetTopics();
  const postQuestion = usePostQuestion();
  const postOpenQuestion = usePostOpenQuestion();

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
      // console.log(topic);
      await postOpenQuestion
        .mutateAsync({
          questionContent: questionContent,
          topic: topic || ""
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
              value={topic}
              sx={{ minWidth: "150px" }}
              onChange={(e, newVal) => setTopic(newVal === "none" ? null : newVal)}
            >
              <Option value={"none"}>None</Option>
              {(topics || []).map(topic => (
                <Option key={topic.id} value={topic.name}>
                  {topic.name}
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
