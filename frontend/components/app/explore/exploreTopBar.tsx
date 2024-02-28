import { Flex } from "@/components/shared/flex";
import { BackButton } from "@/components/shared/top-bar";
import Input from "@mui/joy/Input";
import { FC } from "react";

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const ExploreTopBar: FC<Props> = ({ searchValue, setSearchValue }) => {
  return (
    <Flex y grow gap1>
      <Flex x yc grow gap1>
        <BackButton />
        <Input fullWidth placeholder="Search" value={searchValue} onChange={e => setSearchValue(e.target.value)} />
      </Flex>
    </Flex>
  );
};
