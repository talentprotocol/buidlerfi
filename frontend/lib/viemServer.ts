import { privateKeyToAccount } from "viem/accounts";

export const getAccount = async (privateKey: string) => {
  const account = privateKeyToAccount(`0x${privateKey}`);
  return account;
};

const BUILDERFI_ACCOUNT = await getAccount(process.env.PRIVATE_KEY as string);

export default BUILDERFI_ACCOUNT;
