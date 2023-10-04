"use client";
import { useGetQuestions, usePostQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { MUMBAI_ADDRESS } from "@/lib/address";
import { Box, Button, Input, Typography } from "@mui/joy";
import { Lock, MessageSquare } from "lucide-react";
import { FC, useState } from "react";
import { useAccount, useContractRead } from "wagmi";

interface Props {
  socialData: SocialData;
}

export const ChatTab: FC<Props> = ({ socialData }) => {
  const [chatValue, setChatValue] = useState<string>("");
  const { address } = useAccount();
  const { data: supporterKeys } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "sharesBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const { data: questions, refetch } = useGetQuestions(address, socialData.address);
  const postQuestion = usePostQuestion();

  const sendQuestion = async () => {
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
      <div className="flex flex-col items-center justify-center mt-24">
        <Lock className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Hold atleast one key to access the chat.</p>
      </div>
    );
  }

  return (
    <Box className="flex flex-col flex-grow">
      <Box className="flex flex-grow flex-col space-y-4">
        {!questions?.length ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <MessageSquare className="text-muted-foreground h-32 w-32 mb-6" />
            <p className="text-center">Congratulations. You can now chat with {socialData.name}</p>
          </div>
        ) : (
          questions.map((question, i) => {
            return (
              <Box key={question.id}>
                <Typography fontWeight={500} level="body-md">
                  {i + 1}. {question.questionContent}
                </Typography>
                <Typography level="body-sm">{question.answerContent || "Waiting for answer ..."}</Typography>
              </Box>
            );
          })
        )}
      </Box>
      <Box className="flex flex-row space-x-3">
        <Input
          value={chatValue}
          onChange={e => setChatValue(e.target.value)}
          fullWidth
          placeholder={`Ask a question to ${socialData.name}`}
        />
        <Button className="appearance-none" loading={postQuestion.isLoading} onClick={() => sendQuestion()}>
          Send message
        </Button>
      </Box>
    </Box>
  );
};
