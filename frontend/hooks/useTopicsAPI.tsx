import { getTopic, getTopics } from "@/backend/topic/topic";
import { useQuery } from "wagmi";
import { useAxios } from "./useAxios";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";

export const useGetTopics = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getTopics>>>(["useGetTopics"], "/api/topic");
};

export const useTopic = (id: string) => {
  const axios = useAxios();
  return useQuery([`useTopic/${id}`], () =>
    axios.get<ReturnType<typeof getTopic>>(`/api/topic/${id}`).then(res => res.data)
  );
};
