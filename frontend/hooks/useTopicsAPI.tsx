import { getTopics } from "@/backend/topic/topic";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";

export const useGetTopics = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getTopics>>>(["useGetTopics"], "/api/topics");
};
