import prisma from "@/lib/prisma";

const call = async (questionerWallet: string, replierWallet: string) => {
  return await prisma.question.findMany({
    where: {
      questionerWallet: questionerWallet.toLowerCase(),
      replierWallet: replierWallet.toLowerCase()
    }
  });
};

const GetQuestions = {
  call
};

export default GetQuestions;
