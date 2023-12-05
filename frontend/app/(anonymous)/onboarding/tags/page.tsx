"use client";

import { getTags } from "@/backend/tags/tags";
import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUpdateUser } from "@/hooks/useUserApi";
import { Button, Chip, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function TagsPage() {
  const updateUser = useUpdateUser();
  const { refetch } = useUserContext();
  const router = useBetterRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: tags } = useQuery(["tags"], () => getTags(), { select: data => data.data });

  const skip = () => {
    router.push({ searchParams: { skipTags: "1" } }, { preserveSearchParams: true });
  };

  const handleSelectTags = async () => {
    setIsLoading(true);
    await updateUser
      .mutateAsync({ tags: selectedTags })
      .then(() => refetch())
      .then(() => router.push("./"))
      .catch(() => setIsLoading(false));
  };

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex y>
          <Typography my={1} level="h3">
            Choose 3 areas of expertise
          </Typography>
          <Typography level="body-md" textColor="neutral.600">
            Sharing knowledge on builder.fi can unlock an additional source of income for you. <br />
            What are the 3 main topics other builders can ask you questions about?
          </Typography>
          <Flex x wrap mt={2} gap1>
            {(tags || []).map(tag => (
              <Chip
                size="lg"
                variant={selectedTags.includes(tag.name) ? "soft" : "outlined"}
                color="neutral"
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
          loading={isLoading}
          onClick={handleSelectTags}
          disabled={selectedTags.length === 0 || selectedTags.length > 3}
        >
          Continue
        </Button>
        <Button size="lg" fullWidth variant="plain" onClick={skip} disabled={isLoading}>
          Decide later
        </Button>
      </Flex>
    </Flex>
  );
}
