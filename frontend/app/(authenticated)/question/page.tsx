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
import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useSearch } from "@/hooks/useUserApi";
import { PersonSearchOutlined } from "@mui/icons-material";
import { Input, useTheme } from "@mui/joy";
import { useState } from "react";

export default function QuestionPage() {
  const theme = useTheme();
  const { user } = useUserContext();
  const [searchValue, setSearchValue] = useState("");
  const router = useBetterRouter();
  const { data, isLoading: isSearching, hasNextPage, fetchNextPage } = useSearch(searchValue);
  const { data: holdings, isLoading } = useGetKeyRelationships({
    where: { holderId: user?.id, amount: { gt: 0 }, NOT: [{ ownerId: user?.id }] }
  });
  if (router.searchParams.ask) {
    return <AskQuestion />;
  }

  return (
    <Flex y grow component="main">
      <InjectTopBar withBack title="Ask a question" />

      <Flex x border={"1px solid " + theme.palette.divider} px={2} py={1}>
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
          {isLoading ? (
            <LoadingPage />
          ) : (
            holdings?.map(holding => (
              <UnifiedUserItem
                key={holding.id}
                user={holding.owner}
                hideChevron
                onClick={() => router.push({ searchParams: { ask: true, wallet: holding.owner.wallet } })}
              />
            ))
          )}
        </Flex>
      )}

      {searchValue && (
        <Flex y grow>
          {isSearching ? (
            <LoadingPage />
          ) : data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            data?.map(user => (
              <UnifiedUserItem
                key={user.id}
                user={user}
                hideChevron
                holdersAndReplies={{
                  numberOfReplies: user.numberOfReplies,
                  numberOfHolders: user.numberOfHolders,
                  numberOfQuestions: user.numberOfQuestions
                }}
                onClick={() => router.push({ searchParams: { ask: true, wallet: user.wallet } })}
              />
            ))
          )}
          <LoadMoreButton nextPage={fetchNextPage} isLoading={isSearching} hidden={!hasNextPage} />
        </Flex>
      )}
    </Flex>
  );
}
