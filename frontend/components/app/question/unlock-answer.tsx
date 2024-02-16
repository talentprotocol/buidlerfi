import { PageMessage } from "@/components/shared/page-message";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import { FC, useState } from "react";
import { TradeKeyModal } from "../[wallet]/trade-key-modal";

interface Props {
  profile: ReturnType<typeof useUserProfile>;
  refetch: () => Promise<unknown>;
}

export const UnlockAnswer: FC<Props> = ({ profile, refetch }) => {
  const [buyModalState, setBuyModalState] = useState<"closed" | "buy">("closed");
  return (
    <>
      <PageMessage
        title="This answer is gated"
        icon={<UserAvatar size="sm" user={profile.user} />}
        text={
          <>
            <a style={{ cursor: "pointer" }} onClick={() => setBuyModalState("buy")}>
              Buy {profile.user?.displayName || shortAddress(profile.user?.wallet)}&apos;s key
            </a>{" "}
            to access all his gated answers
          </>
        }
      />
      {buyModalState !== "closed" && profile.user && (
        <TradeKeyModal
          keyOwner={profile.user}
          supporterKeysCount={profile.ownedKeysCount || 0}
          hasKeys={profile.hasKeys}
          isFirstKey={profile.isOwnProfile && profile.holders?.length === 0}
          side={buyModalState}
          close={async () => {
            setBuyModalState("closed");
            await Promise.allSettled([profile.refetch(), refetch()]);
          }}
        />
      )}
    </>
  );
};
