import {
  fetchBuilderfiData,
  fetchContractData,
  fetchHolders,
  fetchHoldings,
  fetchUsers
} from "@/lib/api/common/builderfi";
import { THE_GRAPH_PAGE_SIZE } from "@/lib/constants";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// If we use useQuery from react-query, the result doesn't need to be stored in a context
// useQuery will handle the caching based on the provided key. If this hook is used in multiple places, the data will be cached and reused
export const useBuilderFIData = () => {
  return useQuery(["useBuilderFIData"], () => fetchBuilderfiData());
};

export const useOnchainUsers = () => {
  const [offset, setOffset] = useState(0);
  const { data, isInitialLoading } = useQuery(["useOnchainUsers", offset], () => fetchUsers(offset), {
    keepPreviousData: true
  });
  const nextPage = () => {
    setOffset(prev => prev + THE_GRAPH_PAGE_SIZE);
  };

  return {
    data,
    nextPage,
    isInitialLoading
  };
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

export const useGetContractData = () => {
  return useQuery(["useGetContractData"], () => fetchContractData());
};
