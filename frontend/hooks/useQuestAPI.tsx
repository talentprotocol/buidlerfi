import { getAllQuest, getUserQuest } from "@/backend/quest/quest";
import { useAxios } from "./useAxios";
import { useQuery } from "@tanstack/react-query";

export function useGetQuest() {
  const axios = useAxios();
  return useQuery(["useGetQuest"], () => axios.get<ReturnType<typeof getAllQuest>>("/api/quest").then(res => res.data));
}

export function useGetUserQuest() {
  const axios = useAxios();
  return useQuery(["useGetUserQuest"], () =>
    axios
      .get<ReturnType<typeof getUserQuest>>(`/api/quest/me`)
      .then(res => res.data)
      .then(res => res.data)
  );
}
