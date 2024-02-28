import { getTags } from "@/backend/tags/tags";
import { Flex } from "@/components/shared/flex";
import { LoadingPage } from "@/components/shared/loadingPage";
import { useUserContext } from "@/contexts/userContext";
import { useUpdateUser } from "@/hooks/useUserApi";
import { USER_BIO_MAX_LENGTH } from "@/lib/constants";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";

export const TagsModal: FC = () => {
  const updateUser = useUpdateUser();
  const { user, refetch } = useUserContext();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const { data: tags, isLoading: isLoadingTags } = useQuery(["tags"], () => getTags(), { select: data => data.data });

  const handleSelectTags = async () => {
    setIsLoading(true);
    await updateUser
      .mutateAsync({ tags: selectedTags, bio: bio, hasFinishedOnboarding: true })
      .then(() => refetch())
      .finally(() => setIsLoading(false));
  };
  return (
    <Modal open={true}>
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, minHeight: "500px" }}>
        <Flex y p={3} gap2 ysb grow>
          <Flex y gap={3}>
            <Flex y gap={1}>
              <Typography my={1} level="h3">
                what’s your area of expertise
              </Typography>
              <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
                What are the 3 main topics other builders can ask you questions about? You can change your topics at any
                time.
              </Typography>
              <Flex x wrap mt={2} gap1>
                {isLoadingTags && <LoadingPage />}
                {(tags || []).map(tag => (
                  <Chip
                    size="lg"
                    variant="outlined"
                    color="neutral"
                    sx={{
                      ".MuiChip-action": {
                        backgroundColor: selectedTags.includes(tag.name) ? "neutral.200" : undefined
                      }
                    }}
                    key={tag.id}
                    onClick={() =>
                      setSelectedTags(prev =>
                        prev.includes(tag.name) ? prev.filter(t => t !== tag.name) : [...prev, tag.name]
                      )
                    }
                  >
                    {tag.name}
                  </Chip>
                ))}
              </Flex>
            </Flex>
            <Flex y gap1>
              <Typography>Short bio</Typography>
              <Textarea minRows={3} maxRows={5} value={bio} onChange={e => setBio(e.target.value)} />
              <Typography color={bio.length > USER_BIO_MAX_LENGTH ? "danger" : undefined} level="helper">
                {bio.length}/{USER_BIO_MAX_LENGTH}
              </Typography>
            </Flex>
          </Flex>
          <Flex y gap1>
            {selectedTags.length > 3 && (
              <Typography level="body-xs" color="danger">
                You can only select up to 3 tags
              </Typography>
            )}
            <Button
              size="lg"
              fullWidth
              onClick={handleSelectTags}
              loading={isLoading}
              disabled={
                selectedTags.length === 0 ||
                selectedTags.length > 3 ||
                bio.length > USER_BIO_MAX_LENGTH ||
                bio.length < 10
              }
            >
              Continue
            </Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
