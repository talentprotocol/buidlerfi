import axios from "axios";
import { useMutation } from "wagmi";

interface FarcasterApiParams {
    userId: number;
  }

export const usePublishOnFarcaster = () => {
  return useMutation((params: FarcasterApiParams) => {
    return axios.post(`/api/farcaster/${params.userId}`);
  });
};
