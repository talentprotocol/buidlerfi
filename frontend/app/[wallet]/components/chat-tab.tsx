"use client";
import { Flex } from "@/components/flex";
import { useGetQuestions, usePostQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/address";
import { Button, Input } from "@mui/joy";
import { Lock, MessageSquare } from "lucide-react";
import { FC, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { QuestionEntry } from "./question-entry";

interface Props {
  socialData: SocialData;
}

export const ChatTab: FC<Props> = ({ socialData }) => {
  const [chatValue, setChatValue] = useState<string>("");
  const { address } = useAccount();
  const { data: supporterKeys } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "sharesBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const { data: questions, refetch } = useGetQuestions(socialData.address);

  const postQuestion = usePostQuestion();

  const sendQuestion = async () => {
    if (!address) return;

    await postQuestion.mutateAsync({
      questionContent: chatValue,
      questionerWallet: address,
      replierWallet: socialData.address
    });
    await refetch();
  };

  // const sendReply = async (questionId: number, questionAnswer: string) => {
  // 	const response = await axios.put(`/api/questions/${questionId}`, {
  // 		questionAnswer,
  // 	});

  // 	console.log(response.data);
  // };

  if (supporterKeys === BigInt(0)) {
    return (
      <Flex y xc yc fullwidth>
        <Lock className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Hold atleast one key to access the chat.</p>
      </Flex>
    );
  }

  return (
    <Flex y grow>
      <Flex y grow gap2>
        {!questions?.length ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <MessageSquare className="text-muted-foreground h-32 w-32 mb-6" />
            <p className="text-center">Congratulations. You can now chat with {socialData.name}</p>
          </div>
        ) : (
          questions.map(question => {
            return (
              <QuestionEntry
                key={question.id}
                question={question}
                isOwnChat={address === socialData.address}
                refetch={refetch}
              />
            );
          })
        )}
      </Flex>
      {address !== socialData.address && (
        <Flex x gap2>
          <Input
            value={chatValue}
            onChange={e => setChatValue(e.target.value)}
            fullWidth
            placeholder={`Ask a question to ${socialData.name}`}
            type="text"
          />
          <Button className="appearance-none" loading={postQuestion.isLoading} onClick={() => sendQuestion()}>
            Send message
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
