import prisma from "@/lib/prisma";
import UpsertUser from "../users/upsert";

const call = async (questionerWallet: string, replierWallet: string, questionContent: string) => {
  // Temp fix to create user records for users with the wallet already connected
  await UpsertUser.call(replierWallet);
  await UpsertUser.call(questionerWallet);

  const question = await prisma.question.create({
    data: {
      questionerWallet: questionerWallet.toLowerCase(),
      replierWallet: replierWallet.toLowerCase(),
      questionContent: questionContent
    }
  });

  return question;
};

const CreateQuestion = {
  call
};

export default CreateQuestion;
