import { Flex } from "@/components/shared/flex";
import { BackButton } from "@/components/shared/top-bar";
import { Chip, Input } from "@mui/joy";
import { FC } from "react";

const Tabs = [
  "Friends",
  "Top"
  // "Answers", "Questions"
] as const;
export type TabsEnum = (typeof Tabs)[number];

interface Props {
  selectedTab: TabsEnum;
  setSelectedTab: (tab: TabsEnum) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const ExploreTopBar: FC<Props> = ({ selectedTab, setSelectedTab, searchValue, setSearchValue }) => {
  return (
    <Flex y grow gap1>
      <Flex x yc grow gap1>
        <BackButton />
        <Input fullWidth placeholder="Search" value={searchValue} onChange={e => setSearchValue(e.target.value)} />
      </Flex>
      <Flex
        x
        gap1
        sx={{
          maxWidth: "calc(min(100vw, 500px) - 32px)",
          overflow: "auto",
          scrollbarWidth: "none",
          "::-webkit-scrollbar": {
            display: "none"
          }
        }}
      >
        {searchValue && (
          <Chip color="primary" size="lg">
            Search
          </Chip>
        )}
        {Tabs.map(tab => (
          <Chip
            key={tab}
            color={selectedTab === tab && !searchValue ? "primary" : "neutral"}
            size="lg"
            onClick={() => {
              if (searchValue) setSearchValue("");
              setSelectedTab(tab);
            }}
          >
            {tab}
          </Chip>
        ))}
      </Flex>
    </Flex>
  );
};
