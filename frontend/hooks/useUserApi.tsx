import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetUser = (userId?: string) => {
  return useQuery(["userGetUser", userId], () => axios.get(`/api/users/${userId}`), { enabled: !!userId });
};

export const usePutUser = () => {
  return useMutation((wallet: string) => axios.put("/api/users", { wallet }));
};
