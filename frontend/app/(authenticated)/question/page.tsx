"use client";

import { SearchIcon } from "@/components/icons/search";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UserItem } from "@/components/shared/user-item";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useOnchainUsers } from "@/hooks/useBuilderFiApi";
import { useSearch } from "@/hooks/useUserApi";
import { PersonSearchOutlined } from "@mui/icons-material";
import { CircularProgress, Input, useTheme } from "@mui/joy";
import { useState } from "react";

export default function QuestionPage() {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const router = useBetterRouter();
  const { data, isLoading: isSearching, hasNextPage, fetchNextPage } = useSearch(searchValue);
  const { users, nextPage, isInitialLoading, hasMoreUsers, isLoading: isLoadingMoreUsers } = useOnchainUsers();
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
          {isInitialLoading ? (
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
          ) : (
            users.map(user => (
              <div key={user.id}>
                <UserItem
                  user={{
                    ...user,
                    avatarUrl: user.avatarUrl || undefined,
                    displayName: user.displayName || undefined
                  }}
                  hideChevron
                  onClick={() => router.push({ pathname: `profile/${user.wallet}`, searchParams: { ask: true } })}
                />
              </div>
            ))
          )}
          <LoadMoreButton
            nextPage={nextPage}
            isLoading={isLoadingMoreUsers}
            hidden={isInitialLoading || !hasMoreUsers}
          />
        </Flex>
      )}

      {searchValue && (
        <Flex y grow>
          {isSearching ? (
            <Flex y yc xc grow>
              <CircularProgress />
            </Flex>
          ) : data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            data?.map(user => (
              <UserItem
                key={user.id}
                user={{ ...user, avatarUrl: user.avatarUrl || undefined, displayName: user.displayName || undefined }}
                hideChevron
              />
            ))
          )}
          <LoadMoreButton nextPage={fetchNextPage} isLoading={isSearching} hidden={!hasNextPage} />
        </Flex>
      )}
    </Flex>
  );
}
