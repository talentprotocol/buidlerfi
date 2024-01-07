"use client";
import { KeyIcon } from "@/components/icons/key";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AccessTimeOutlined } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { FC } from "react";
import { QuestionEntry } from "./question-entry";
import QuestionModal from "./question-modal";

interface Props {
  onBuyKeyClick: () => void;
  type: "answers" | "questions";
  profile?: ReturnType<typeof useUserProfile>;
}

export const QuestionsList: FC<Props> = ({ onBuyKeyClick, type, profile }) => {
  const router = useBetterRouter();
  const questionsToUse = type === "answers" ? profile?.questions : profile?.questionsAsked;
  const hasQuestion: boolean = !!questionsToUse?.length;
  // const hasQuestion: boolean = false;
  if (!profile || profile.isLoading) {
    return <LoadingPage />;
  }

  const getMessage = () => {
    if (hasQuestion) {
      return null;
    }

    if (type === "questions") {
      if (!profile?.isOwnProfile) {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: profile?.user?.displayName + " didn’t ask any questions to other builders yet"
        };
      } else {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: "You haven't asked any questions to other builders yet"
        };
      }
    }

    if (!profile?.isOwnProfile) {
      if (profile?.hasLaunchedKeys) {
        if (!profile?.hasKeys) {
          return {
            title: `you don't hold any keys of ${profile?.user?.displayName}`,
            icon: <AccessTimeOutlined />,
            text: "hold " + profile?.user?.displayName + "'s keys to ask him a question"
          };
        } else {
          return {
            title: "you have a key",
            icon: <KeyIcon />,
            text: "ask the first question to " + profile?.user?.displayName,
            button: <Button onClick={() => router.push({ searchParams: { ask: true } })}>Ask question</Button>
          };
        }
      } else {
        return {
          title: "not accepting questions yet",
          icon: <AccessTimeOutlined />,
          text: profile?.user?.displayName + " didn’t create their keys, but we can notify you when they do"
        };
      }
    } else {
      if (!profile?.hasLaunchedKeys) {
        return {
          title: "Unlock Q&A",
          icon: <KeyIcon />,
          text: "Create your keys to allow others to ask you direct questions",
          button: <Button onClick={() => onBuyKeyClick()}>Create keys</Button>
        };
      } else {
        return {
          title: "no answers to show",
          icon: <AccessTimeOutlined />,
          text: "You haven't received any questions yet"
        };
      }
    }
  };

  const message = getMessage();
  if (message) {
    return (
      <Flex y m={2}>
        <PageMessage title={message.title} icon={message.icon} text={message.text} />
        {!message.button ? null : (
          <Flex y gap2 xc grow yc>
            {message.button}
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <>
      {router.searchParams.question && (
        <QuestionModal
          profile={profile}
          questionId={Number(router.searchParams.question)}
          close={() => {
            profile?.refetch();
            router.replace("./");
          }}
        />
      )}
      <Flex y grow>
        <Flex y grow sx={{ "& > div:last-child": { border: "none" } }}>
          {questionsToUse?.map(question => {
            return (
              <QuestionEntry
                refetch={profile.refetch}
                key={question.id}
                question={question}
                type={"home"}
                onClick={() => router.replace({ searchParams: { question: question.id.toString() } })}
              />
            );
          })}
          <LoadMoreButton query={profile?.getQuestionsFromReplierQuery} />
        </Flex>
      </Flex>
    </>
  );
};
