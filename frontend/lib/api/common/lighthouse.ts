import BUILDERFI_ACCOUNT from "@/lib/viemServer";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";

export const getApiKey = async () => {
  const wallet = BUILDERFI_ACCOUNT;
  const verificationMessage = (
    await axios.get(`https://api.lighthouse.storage/api/auth/get_message?publicKey=${wallet.publicKey}`)
  ).data;
  const signedMessage = await wallet.signMessage(verificationMessage);
  const response = await lighthouse.getApiKey(wallet.publicKey, signedMessage);
  return response;
};

export const uploadJson = async (name: string, object: Record<string, never>) => {
  const apiKey = process.env.LIGHTHOUSE_API_KEY as string;

  const response = await lighthouse.uploadText(JSON.stringify(object), apiKey, name);

  return response;
};
