import { fetchBuilderfiData } from "@/api/builderfi.api";
import { useQuery } from "@tanstack/react-query";

// If we use useQuery from react-query, the result doesn't need to be stored in a context
// useQuery will handle the caching based on the provided key. If this hook is used in multiple places, the data will be cached and reused
export const useBuilderFIData = () => {
  return useQuery(["useBuilderFIData"], () => fetchBuilderfiData());
};
