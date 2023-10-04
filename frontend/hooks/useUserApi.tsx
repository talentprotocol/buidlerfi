import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const usePutUser = () => {
  return useMutation((wallet: string) => axios.put("/api/users", { wallet }));
};
