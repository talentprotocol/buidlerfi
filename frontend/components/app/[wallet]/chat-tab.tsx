"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { useGetQuestions, usePostQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/constants";
import theme from "@/theme";
import { Chat, KeyOutlined, LockOpen, LockOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Textarea, Typography } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { FC, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { QuestionEntry } from "./question-entry";

interface Props {
  socialData: SocialData;
  isOwnProfile: boolean;
}

export const ChatTab: FC<Props> = ({ socialData, isOwnProfile }) => {
  const [chatValue, setChatValue] = useState<string>("");
  const { address } = useAccount();
  const { data: supporterKeys } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "builderCardsBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const ownsKeys = supporterKeys !== undefined && supporterKeys > BigInt(0);

  const { data: questions, refetch, isLoading } = useGetQuestions(socialData.address);

  const postQuestion = usePostQuestion();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const sendQuestion = async () => {
    if (!address) return;

    await postQuestion.mutateAsync({
      questionContent: chatValue,
      replierWallet: socialData.address
    });
    await refetch();
    setChatValue("");
  };

  if (!ownsKeys && !isOwnProfile) {
    return (
      <PageMessage
        title="Unlock Q&A"
        icon={<LockOutlined />}
        text={`Hold at least one key to ask ${socialData.name} a question and access the answers`}
      />
    );
  }

  if (!ownsKeys && isOwnProfile) {
    return (
      <PageMessage
        title={"Unlock Q&A"}
        icon={<KeyOutlined />}
        text="Launch your keys to allow others to trade your keys and ask you questions"
      />
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

  return (
    <Flex y grow>
      {!isOwnProfile && (
        <Flex y grow gap={0.5} p={2} borderBottom={"1px solid " + theme.palette.divider}>
          <Flex y={isSm} yc gap2>
            <Textarea
              value={chatValue}
              onChange={e => setChatValue(e.target.value)}
              error={chatValue.length > 500}
              placeholder={`Ask a question to ${socialData.name}`}
              sx={{ flexGrow: 1 }}
            />
            <Button
              disabled={chatValue.length > 500}
              className="appearance-none"
              loading={postQuestion.isLoading}
              onClick={() => sendQuestion()}
            >
              Ask
            </Button>
          </Flex>
          <Typography level="body-sm">{chatValue.length}/500</Typography>
        </Flex>
      )}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Flex y grow>
          {ownsKeys && !questions?.length ? (
            <PageMessage text={`Congratulations. You can now chat with ${socialData.name}`} icon={<LockOpen />} />
          ) : (
            questions?.map((question, i) => {
              return (
                <QuestionEntry
                  key={question.id}
                  socialData={socialData}
                  question={question}
                  isOwnChat={isOwnProfile}
                  refetch={refetch}
                  index={`${questions.length - i}/${questions.length}`}
                />
              );
            })
          )}
        </Flex>
      )}
    </Flex>
  );
};
