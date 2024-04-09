import { SearchIcon } from "@/components/icons/search";
import { Flex } from "@/components/shared/flex";
import { Sidebar } from "@/components/shared/side-bar";
import { useUserContext } from "@/contexts/userContext";
import Close from "@mui/icons-material/Close";
import { Avatar, Typography } from "@mui/joy";
import Input from "@mui/joy/Input";
import { FC, useState } from "react";

// interface Props {
//   searchValue: string;
//   setSearchValue: (value: string) => void;
// }
interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
  title: string;
}

export const QuestionSearch: FC<Props> = ({ searchValue, setSearchValue, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticatedAndActive } = useUserContext();
  return (
    <Flex y grow gap1>
      <Flex x xsb fullwidth gap1 yc>
        <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />
        <Avatar
          size="md"
          alt={user?.displayName?.[0]}
          src={isAuthenticatedAndActive && user?.avatarUrl ? user.avatarUrl : ""}
          sx={{ position: "relative", cursor: "pointer" }}
          onClick={() => setIsSidebarOpen(true)}
        />
        <Typography level="title-md" textAlign="center" sx={{ display: !showSearch ? "flex" : "none" }}>
          {title}
        </Typography>
        <SearchIcon
          size="sm"
          onClick={() => setShowSearch(true)}
          sx={{ display: !showSearch ? "block" : "none", cursor: "pointer" }}
        />
        <Input
          fullWidth
          placeholder="Search"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          sx={{ display: showSearch ? "flex" : "none" }}
          endDecorator={
            <Close
              onClick={() => {
                setShowSearch(false), setSearchValue("");
              }}
              sx={{ cursor: "pointer" }}
            />
          }
        />
      </Flex>
    </Flex>
  );
};
