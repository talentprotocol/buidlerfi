"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { useGetQuestions, usePostQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/constants";
import theme from "@/theme";
import { Chat, Lock, LockOpen, LockOutlined } from "@mui/icons-material";
import { Button, Textarea } from "@mui/joy";
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

  const { data: questions, refetch } = useGetQuestions(socialData.address);

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
        text={`Hold at least one card to ask ${socialData.name} a question and access the answers.`}
      />
    );
  }

  if (!ownsKeys && isOwnProfile) {
    return (
      <PageMessage
        icon={<Lock />}
        text="Buy the first card to allow others to trade your cards and ask you questions."
      />
    );
  }

  if (isOwnProfile && !questions?.length) {
    return <PageMessage icon={<Chat />} text="Questions asked by holders of your cards will appear here." />;
  }

  return (
    <Flex y grow>
      <Flex y grow gap2>
        {ownsKeys && !questions?.length ? (
          <PageMessage text={`Congratulations. You can now chat with ${socialData.name}`} icon={<LockOpen />} />
        ) : (
          questions?.map(question => {
            return (
              <QuestionEntry
                key={question.id}
                socialData={socialData}
                question={question}
                isOwnChat={isOwnProfile}
                refetch={refetch}
              />
            );
          })
        )}
      </Flex>
      {!isOwnProfile && (
        <Flex y={isSm} yc gap2>
          <Textarea
            value={chatValue}
            onChange={e => setChatValue(e.target.value)}
            error={chatValue.length > 500}
            placeholder={`Ask a question to ${socialData.name}`}
            endDecorator={<>{chatValue.length}/500</>}
            sx={{ flexGrow: 1 }}
          />
          <Button
            disabled={chatValue.length > 500}
            className="appearance-none"
            loading={postQuestion.isLoading}
            onClick={() => sendQuestion()}
          >
            Post Question
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
