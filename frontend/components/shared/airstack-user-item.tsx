"use client";
import { GetFollowersResponse } from "@/app/api/airstack/followers/route";
import { useGetUser } from "@/hooks/useUserApi";
import { ipfsToURL } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  dappName: string;
  airstackUser: GetFollowersResponse["Follower"][number]["followerAddress"];
}

export function AirstackUserItem({ dappName, airstackUser }: Props) {
  const router = useRouter();
  const [address, avatar, name] = useMemo(() => {
    const profile = airstackUser.socials.find(item => item.dappName === dappName);
    return [airstackUser.addresses[0], ipfsToURL(profile?.profileImage), profile?.profileName];
  }, [airstackUser, dappName]);

  const { data: user, isLoading } = useGetUser(address);

  return (
    <>
      <Flex
        x
        xsb
        yc
        px={{ xs: 0, sm: 2 }}
        py={1}
        sx={{ ":hover": { backgroundColor: "neutral.100" }, cursor: "pointer" }}
        className="transition-all"
        onClick={() => user && router.push(`/profile/${user.wallet}`)}
      >
        <Flex x yc gap2>
          <Avatar size="sm" src={avatar}>
            <Skeleton loading={isLoading} />
          </Avatar>
          <Flex y gap={0.5}>
            <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
              <Skeleton loading={isLoading}>{name}</Skeleton>
            </Typography>
            <Typography textColor={"neutral.500"} level="body-sm">
              {dappName}
            </Typography>
          </Flex>
        </Flex>
        {user && <ChevronRight />}
      </Flex>
    </>
  );
}
