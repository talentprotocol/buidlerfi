import { getAllQuest, getUserQuest } from "@/backend/quest/quest";
import { verifyAllQuestsSA } from "@/backend/quest/questServerAction";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useMutationSA } from "./useMutationSA";

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
export const useVerifyQuests = () => {
  return useMutationSA(options => verifyAllQuestsSA(options));
};
