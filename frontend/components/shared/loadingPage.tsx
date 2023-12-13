import { CircularProgress } from "@mui/joy";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  minHeight?: string;
}

export const LoadingPage: FC<Props> = ({ minHeight }) => {
  return (
    <Flex y yc xc grow minHeight={minHeight}>
      <CircularProgress />
    </Flex>
  );
};
