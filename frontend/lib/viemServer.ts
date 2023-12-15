import { privateKeyToAccount } from "viem/accounts";

export const getAccount = async (privateKey: string) => {
  const account = privateKeyToAccount(`0x${privateKey}`);
  return account;
};
