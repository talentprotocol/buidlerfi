import { fetchBuilderfiData, fetchContractData, fetchHoldings } from "@/lib/api/common/builderfi";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { ShareRelationship } from "@/models/shareRelationship.model";
import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

// If we use useQuery from react-query, the result doesn't need to be stored in a context
// useQuery will handle the caching based on the provided key. If this hook is used in multiple places, the data will be cached and reused
export const useBuilderFIData = () => {
  return useQuery(["useBuilderFIData"], () => fetchBuilderfiData());
};

export interface UserWithOnchainData extends User {
  buyPrice: string;
  numberOfHolders: string;
}
export const useGetHoldings = (address?: `0x${string}`, options?: SimpleUseQueryOptions<ShareRelationship[]>) => {
  return useQuery(["useGetHoldings", address], () => fetchHoldings(address!), {
    enabled: !!address,
    ...options
  });
};

export const useGetContractData = () => {
  return useQuery(["useGetContractData"], () => fetchContractData());
};
