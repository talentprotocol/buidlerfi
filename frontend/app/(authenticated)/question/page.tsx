"use client";

import { AskQuestion } from "@/components/app/[wallet]/ask-question";
import { SearchIcon } from "@/components/icons/search";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetQuestionableUsers } from "@/hooks/useUserApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import Avatar from "@mui/joy/Avatar";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { useState } from "react";

export default function QuestionPage() {
  const { isLoading } = useUserContext();
  const [searchValue, setSearchValue] = useState("");
  const router = useBetterRouter();
  const debouncedValue = useDebounce(searchValue, 500);
  const questionableUsers = useGetQuestionableUsers(debouncedValue);
  if (router.searchParams.ask) {
    return <AskQuestion />;
  }
  return (
    <Flex y grow component="main">
      <InjectTopBar withBack title="Ask a question" />

      <Flex y gap2 sx={{ border: theme => "1px solid " + theme.palette.divider }} px={2} py={1}>
        <Input
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          fullWidth
          startDecorator={<SearchIcon />}
          placeholder="Search..."
        />
      </Flex>

      <Flex y grow>
        {isLoading || questionableUsers.isLoading ? (
          <LoadingPage />
        ) : (
          <>
            <Flex
              x
              px={2}
              py={1}
              gap2
              sx={{ cursor: "pointer", ":hover": { bgcolor: theme => theme.palette.neutral[100] } }}
              onClick={() => router.push({ searchParams: { ask: true } })}
            >
              <Avatar size="sm" src={LOGO_BLUE_BACK} alt="logo" />
              <Typography level="title-sm" sx={{ alignSelf: "center" }}>
                Ask an Open Question
              </Typography>
            </Flex>
            {questionableUsers?.data?.map(user => (
              <UnifiedUserItem
                key={user.id}
                user={user}
                onClick={() => router.push({ searchParams: { ask: true, wallet: user.wallet } })}
                bio={user.bio || " "}
              />
            ))}
          </>
        )}
        <LoadMoreButton query={questionableUsers} />
      </Flex>
    </Flex>
  );
}
