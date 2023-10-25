import { fetchBuilderfiData, fetchHolders, fetchHoldings } from "@/lib/api/common/builderfi";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";

// If we use useQuery from react-query, the result doesn't need to be stored in a context
// useQuery will handle the caching based on the provided key. If this hook is used in multiple places, the data will be cached and reused
export const useBuilderFIData = () => {
  return useQuery(["useBuilderFIData"], () => fetchBuilderfiData());
};

export const useGetHoldings = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  return useQuery(["useGetHoldings", address], () => fetchHoldings(address!), {
    enabled: !!address,
    ...options
  });
};

export const useGetHolders = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  return useQuery(["useGetHolders", address], () => fetchHolders(address!), {
    enabled: !!address,
    ...options
  });
};
