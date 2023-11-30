"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { useProfileContext } from "@/contexts/profileContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { Chat, KeyOutlined, LockOpen, LockOutlined } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/joy";
import { FC } from "react";
import { QuestionEntry } from "./question-entry";
import QuestionModal from "./question-modal";

interface Props {
  onBuyKeyClick: () => void;
}

export const ChatTab: FC<Props> = ({ onBuyKeyClick }) => {
  const { isOwnProfile, socialData, hasKeys, questions, isLoading, refetch } = useProfileContext();
  const router = useBetterRouter();

  if (!hasKeys && !isOwnProfile && !questions?.length) {
    return (
      <PageMessage
        title="Unlock Q&A"
        icon={<LockOutlined />}
        text={`Hold at least one key to ask ${socialData.displayName} a question and access the answers`}
      />
    );
  }

  if (!hasKeys && isOwnProfile) {
    return (
      <Flex y gap2 xc grow yc>
        <PageMessage
          title={"Unlock Q&A"}
          icon={<KeyOutlined />}
          text="Create your keys to allow others to ask you direct questions."
          sx={{ flexGrow: 0 }}
        />
        <Button onClick={() => onBuyKeyClick()}>Create keys</Button>
      </Flex>
    );
  }

  if (isOwnProfile && !questions?.length) {
    return (
      <PageMessage
        title="You don't have any questions"
        icon={<Chat />}
        text="Your Q&A will appear here as soon as one of your holders asks you a question"
      />
    );
  }

  if (isLoading) {
    return (
      <Flex y xc yc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return (
    <>
      {router.searchParams.question && (
        <QuestionModal
          questionId={Number(router.searchParams.question)}
          close={() => {
            refetch();
            router.replace("./");
          }}
        />
      )}
      <Flex y grow pb={6}>
        <Flex y grow sx={{ "& > div:last-child": { border: "none" } }}>
          {hasKeys && !questions?.length ? (
            <PageMessage
              text={`Congratulations. You can now ask ${socialData.displayName} a question.`}
              icon={<LockOpen />}
            />
          ) : (
            questions?.map(question => {
              return (
                <QuestionEntry
                  key={question.id}
                  socialData={socialData}
                  question={question}
                  isOwnChat={isOwnProfile}
                  ownsKeys={hasKeys}
                  refetch={refetch}
                  onClick={() => router.replace({ searchParams: { question: question.id.toString() } })}
                />
              );
            })
          )}
        </Flex>
      </Flex>
    </>
  );
};
