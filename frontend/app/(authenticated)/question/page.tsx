"use client";

import { AskQuestion } from "@/components/app/[wallet]/ask-question";
import { SearchIcon } from "@/components/icons/search";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useSearch } from "@/hooks/useUserApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { PersonSearchOutlined } from "@mui/icons-material";
import { Avatar, Input, Typography, useTheme } from "@mui/joy";
import { useState } from "react";

export default function QuestionPage() {
  const theme = useTheme();
  const { user, holding, isLoading } = useUserContext();
  const [searchValue, setSearchValue] = useState("");
  const router = useBetterRouter();
  const searchUsers = useSearch(searchValue, true);
  if (router.searchParams.ask) {
    return <AskQuestion />;
  }

  return (
    <Flex y grow component="main">
      <InjectTopBar withBack title="Ask a question" />

      <Flex y gap2 border={"1px solid " + theme.palette.divider} px={2} py={1}>
        <Input
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          fullWidth
          startDecorator={<SearchIcon />}
          placeholder="Search..."
        />
      </Flex>

      {!searchValue && (
        <Flex y grow>
          <Flex
            x
            px={2}
            py={1}
            gap2
            sx={{ cursor: "pointer", ":hover": { bgcolor: theme.palette.neutral[100] } }}
            onClick={() => router.push({ searchParams: { ask: true } })}
          >
            <Avatar size="sm" src={LOGO_BLUE_BACK} alt="logo" />
            <Typography level="title-sm" sx={{ alignSelf: "center" }}>
              Ask an Open Question
            </Typography>
          </Flex>
          {isLoading ? (
            <LoadingPage />
          ) : (
            holding
              ?.filter(holding => holding.ownerId !== user?.id)
              .map(holding => (
                <UnifiedUserItem
                  key={holding.id}
                  user={holding.owner}
                  onClick={() => router.push({ searchParams: { ask: true, wallet: holding.owner.wallet } })}
                />
              ))
          )}
        </Flex>
      )}
      {searchValue && (
        <Flex y grow>
          {searchUsers.isLoading ? (
            <LoadingPage />
          ) : searchUsers.data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            searchUsers.data?.map(user => (
              <UnifiedUserItem
                key={user.id}
                user={user}
                holdersAndReplies={{
                  numberOfReplies: user.numberOfReplies,
                  numberOfHolders: user.numberOfHolders,
                  numberOfQuestions: user.numberOfQuestions
                }}
                onClick={() => router.push({ searchParams: { ask: true, wallet: user.wallet } })}
              />
            ))
          )}
          <LoadMoreButton query={searchUsers} />
        </Flex>
      )}
    </Flex>
  );
}
