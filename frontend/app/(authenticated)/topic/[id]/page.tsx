"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { Flex } from "@/components/shared/flex";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useTopic } from "@/hooks/useTopicsAPI";
import { AccessTimeOutlined } from "@mui/icons-material";
import { useEffect } from "react";

export default function TopicPage({ params }: { params: { id: string } }) {
  // const { user: currentUser } = useUserContext();
  // const profile = useUserProfile(currentUser?.wallet);
  const topic = useTopic(params.id);
  // const [, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");
  console.log(topic);

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar withBack title={topic?.data?.name || undefined} />
      {topic.isLoading && <LoadingPage />}
      {!topic.isLoading && topic?.data?.questions.length === 0 && (
        <Flex y grow>
          <PageMessage
            title={"no questions to show"}
            icon={<AccessTimeOutlined />}
            text={"maybe you should be the first asking a question in this topic!"}
          />
        </Flex>
      )}
      {topic.data?.questions?.map(question => (
        <QuestionEntry key={question?.id} question={question} refetch={topic?.refetch} />
      ))}
      {/* <QuestionsList profile={profile} onBuyKeyClick={() => setBuyModalState("buy")} type="questions" /> */}
      {/* <Overview profile={profile} setBuyModalState={setBuyModalState} />
      <Tabs defaultValue={"answers"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="answers">{profile.questions?.length} Answers</Tab>
          <Tab value="questions">{profile.questionsAsked?.length} Questions</Tab>
        </TabList>
        <TabPanel value="answers" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="answers" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
        <TabPanel value="questions" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="questions" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
      </Tabs> */}
    </Flex>
  );
}
