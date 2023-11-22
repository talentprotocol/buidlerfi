import { getBulkUsersSA } from "@/backend/user/userServerActions";
import {
  fetchBuilderfiData,
  fetchContractData,
  fetchHolders,
  fetchHoldings,
  fetchUsers
} from "@/lib/api/common/builderfi";
import { THE_GRAPH_PAGE_SIZE } from "@/lib/constants";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { Share } from "@/models/share.model";
import { User } from "@prisma/client";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import _, { orderBy } from "lodash";
import { useState } from "react";

// If we use useQuery from react-query, the result doesn't need to be stored in a context
// useQuery will handle the caching based on the provided key. If this hook is used in multiple places, the data will be cached and reused
export const useBuilderFIData = () => {
  return useQuery(["useBuilderFIData"], () => fetchBuilderfiData());
};

export interface UserWithOnchainData extends User {
  buyPrice: string;
  numberOfHolders: string;
}

export const useOnchainUsers = () => {
  const { getAccessToken } = usePrivy();
  const [users, setUsers] = useState<UserWithOnchainData[]>([]);
  const [hasMoreUsers, setHasMoreUsers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  //Only for initial loading. After the initial loading, it's handled by the nextPage function
  const { isInitialLoading } = useQuery(["useOnchainUsers"], () => fetchUsers(0), {
    onSuccess: data => {
      fetchUserAndMerge(data.shareParticipants);
    },
    cacheTime: 0
  });

  const fetchUserAndMerge = async (users: Share[]) => {
    const addresses: Record<string, Share> = users.reduce(
      (prev, item) => ({ ...prev, [item.owner.toLowerCase()]: item }),
      {}
    );
    const res = await getBulkUsersSA(Object.keys(addresses), { authorization: await getAccessToken() });
    const merged = (res.data || []).map(user => {
      const onChainData = addresses[user.wallet.toLowerCase() as keyof typeof addresses];
      return {
        ...user,
        buyPrice: onChainData.buyPrice || "",
        numberOfHolders: onChainData.numberOfHolders || "0"
      };
    });
    setUsers(prev => orderBy(_.uniqBy([...prev, ...merged], "id"), user => Number(user.buyPrice), "desc"));
  };

  const nextPage = async () => {
    console.log("try nextpage");
    if (isLoading || !hasMoreUsers) return;

    setIsLoading(true);
    const currentOffset = offset + THE_GRAPH_PAGE_SIZE;
    setOffset(currentOffset);

    // Assuming fetchUsers returns a promise with the users data
    const newUsers = await fetchUsers(currentOffset);
    if (
      !newUsers ||
      newUsers.shareParticipants.length === 0 ||
      newUsers.shareParticipants.length < THE_GRAPH_PAGE_SIZE
    ) {
      setHasMoreUsers(false);
    }
    await fetchUserAndMerge(newUsers.shareParticipants);
    setIsLoading(false);
  };

  return {
    users,
    nextPage,
    isInitialLoading,
    hasMoreUsers,
    isLoading
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
