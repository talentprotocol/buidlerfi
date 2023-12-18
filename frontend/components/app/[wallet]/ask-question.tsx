import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { LoadingPage } from "@/components/shared/loadingPage";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useEditQuestion, useGetQuestion, usePostQuestion } from "@/hooks/useQuestionsApi";
import { useSocialData } from "@/hooks/useSocialData";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH } from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import { Button, Typography } from "@mui/joy";
import { useMemo, useState } from "react";

export const AskQuestion = () => {
  const { user } = useUserContext();
  const router = useBetterRouter();
  const { wallet, questionToEdit } = router.searchParams;
  const socialData = useSocialData(wallet as `0x${string}`);
  const [questionContent, setQuestionContent] = useState("");
  const [showBadQuestionLabel, setShowBadQuestionLabel] = useState(false);
  const postQuestion = usePostQuestion();
  const editQuestion = useEditQuestion();

  const { data: question, isLoading } = useGetQuestion(questionToEdit as number, {
    enabled: !!questionToEdit,
    //Need to fix this to add typescript inference
    onSuccess: (data: unknown) => {
      const questionData = data as { questionContent: string };
      setQuestionContent(questionData.questionContent);
    },
    cacheTime: 0,
    staleTime: 0
  });

  const { userId, displayName } = useMemo(() => {
    return question
      ? {
          userId: question.replier.id,
          displayName: question.replier.displayName || shortAddress(question.replier.wallet)
        }
      : { ...socialData };
  }, [question, socialData]);

  const isEditMode = questionToEdit !== undefined;

  const sendQuestion = async () => {
    if (!questionContent.includes("?")) {
      setShowBadQuestionLabel(true);
      return;
    } else {
      setShowBadQuestionLabel(false);
    }

    if (isEditMode) {
      await editQuestion
        .mutateAsync({
          questionId: questionToEdit as number,
          questionContent: questionContent
        })
        .then(res => {
          router.replace(`/question/${res?.id}`);
        });
    } else {
      await postQuestion
        .mutateAsync({
          questionContent: questionContent,
          replierId: userId
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
            loading={postQuestion.isLoading}
            disabled={questionContent.length < MIN_QUESTION_LENGTH || questionContent.length > MAX_QUESTION_LENGTH}
            onClick={sendQuestion}
          >
            {isEditMode ? "Edit" : "Ask"}
          </Button>
        }
      />
      {questionToEdit && isLoading ? (
        <LoadingPage minHeight="300px" />
      ) : (
        <>
          <Flex y gap2 p={2} grow>
            <Flex x xsb yc>
              <Typography level="title-sm">Ask {displayName}</Typography>
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
      )}
    </>
  );
};
