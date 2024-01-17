"use client";

import { getTags } from "@/backend/tags/tags";
import { socialInfo, socialsOrder } from "@/components/app/[wallet]/overview";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { useRefreshCurrentUser, useUpdateUser } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { USER_BIO_MAX_LENGTH } from "@/lib/constants";
import { formatError, shortAddress } from "@/lib/utils";
import { RefreshOutlined } from "@mui/icons-material";
import { Avatar, Button, Card, Chip, Link as JoyLink, Textarea, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EditProfilePage() {
  const { user: currentUser, refetch } = useUserContext();

  const profile = useUserProfile(currentUser?.wallet);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bio, setBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsready] = useState(false);

  useEffect(() => {
    if (currentUser && !isReady) {
      setBio(currentUser.bio || "");
      setSelectedTags(currentUser.tags.map(tag => tag.name));
      setIsready(true);
    }
  }, [isReady, currentUser]);

  const updateUser = useUpdateUser();
  const router = useBetterRouter();

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await updateUser
      .mutateAsync({ tags: selectedTags, bio: bio })
      .then(async () => {
        toast.success("Profile updated");
        await Promise.allSettled([profile.refetch(), refetch()]);
        router.replace("/profile/" + currentUser?.wallet.toLowerCase());
      })
      .catch(err => {
        setIsLoading(false);
        toast.error(formatError(err));
      });
  };

  const { data: tags } = useQuery(["tags"], () => getTags(), { select: data => data.data });

  const handleChipClick = (tag: NonNullable<typeof tags>[number]) => {
    setSelectedTags(prev => {
      let res: typeof selectedTags = [];
      if (prev.includes(tag.name)) {
        res = prev.filter(t => t !== tag.name);
      } else {
        res = [...prev, tag.name];
      }

      return res;
    });
  };

  const { linkWallet } = useLinkExternalWallet();
  const refreshData = useRefreshCurrentUser();
  const handleLinkOrRefreshWallet = async () => {
    if (currentUser?.socialWallet) {
      await refreshData.mutateAsync();
      await refetch();
      toast.success("Profile info imported from your web3 social profiles");
    } else {
      linkWallet(refetch);
    }
  };

  return (
    <Flex y grow component="main" gap2 p={2}>
      <InjectTopBar
        withBack
        title="Edit profile"
        endItem={
          <Button
            loading={isLoading}
            disabled={selectedTags.length > 3 || bio.length > USER_BIO_MAX_LENGTH}
            onClick={() => handleSaveProfile()}
          >
            Save
          </Button>
        }
      />
      <Card sx={{ backgroundColor: "#FBFCFE", gap: 2 }}>
        <Flex x yc gap2>
          <Avatar size="lg" sx={{ height: "56px", width: "56px" }} src={currentUser?.avatarUrl || undefined} />
          <Typography level="h3">{currentUser?.displayName || shortAddress(currentUser?.wallet)}</Typography>
        </Flex>

        <Flex x gap2 flexWrap={"wrap"}>
          {currentUser?.socialProfiles
            .sort((a, b) => {
              return socialsOrder.indexOf(a.type) - socialsOrder.indexOf(b.type);
            })
            .map(social => {
              const additionalData = socialInfo[social.type as keyof typeof socialInfo];
              return (
                <JoyLink
                  key={social.type}
                  href={additionalData.url(social.profileName, currentUser?.socialWallet || "")}
                  target="_blank"
                  textColor={"link"}
                  variant="outlined"
                  color="neutral"
                  p={0.5}
                  sx={{ borderRadius: "50%" }}
                >
                  {additionalData.icon}
                </JoyLink>
              );
            })}
        </Flex>
        <Flex y>
          <Typography level="title-sm">Refresh your social data</Typography>
          <Typography level="body-sm">Click below to get updated data from your web3 social profiles.</Typography>
          <Button
            sx={{ alignSelf: "flex-start", mt: 2 }}
            variant="outlined"
            color="neutral"
            loading={!!currentUser?.socialWallet && refreshData.isLoading}
            onClick={handleLinkOrRefreshWallet}
            startDecorator={<RefreshOutlined />}
          >
            {currentUser?.socialWallet ? "Refresh" : "Import web3 socials"}
          </Button>
        </Flex>
      </Card>
      <Flex y gap1>
        <Typography>Short bio</Typography>
        <Textarea minRows={3} maxRows={5} value={bio} onChange={e => setBio(e.target.value)} />
        <Typography color={bio.length > USER_BIO_MAX_LENGTH ? "danger" : undefined} level="helper">
          {bio.length}/{USER_BIO_MAX_LENGTH}
        </Typography>
      </Flex>
      <Flex y gap1>
        <Typography>Topics</Typography>
        <Flex x wrap mt={2} gap1>
          {(tags || []).map(tag => (
            <Chip
              size="sm"
              variant={"outlined"}
              color={"neutral"}
              sx={{
                ".MuiChip-action": { backgroundColor: selectedTags.includes(tag.name) ? "neutral.200" : undefined }
              }}
              key={tag.id}
              onClick={() => handleChipClick(tag)}
            >
              {tag.name}
            </Chip>
          ))}
        </Flex>
        <Typography color={selectedTags.length > 3 ? "danger" : undefined} level="helper">
          {selectedTags.length}/3
        </Typography>
      </Flex>
    </Flex>
  );
}
