import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useContext, useMemo } from "react";
import { useAccount } from "wagmi";

interface ProfileContextType {
  holders: ReturnType<typeof useGetHolders>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

const ProfileContext = createContext<ProfileContextType>({
  hasKeys: false,
  holders: [],
  ownedKeysCount: 0,
  supporterNumber: 0,
  isLoading: true,
  refetch: () => Promise.resolve()
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAccount();
  const { wallet } = useParams();
  const { data: holders, isLoading, refetch } = useGetHolders(wallet as `0x${string}`);
  const [supporterNumber, ownedKeysCount] = useMemo(() => {
    if (!holders) return [undefined, undefined];

    const holder = holders.find(holder => holder.holder.owner.toLowerCase() === address?.toLowerCase());
    if (!holder) return [undefined, 0];
    else return [Number(holder.supporterNumber), Number(holder.heldKeyNumber)];
  }, [address, holders]);

  const hasKeys = useMemo(() => !!ownedKeysCount && ownedKeysCount > 0, [ownedKeysCount]);

  const sortedHolders = useMemo(
    () => holders?.sort((a, b) => Number(a.supporterNumber) - Number(b.supporterNumber)),
    [holders]
  );

  const value = useMemo(() => {
    return {
      holders: sortedHolders,
      supporterNumber: supporterNumber,
      ownedKeysCount: ownedKeysCount || 0,
      hasKeys,
      isLoading,
      refetch
    };
  }, [hasKeys, holders, isLoading, ownedKeysCount, supporterNumber, refetch]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
