import { Flex } from "@/components/shared/flex";
import { Typography } from "@mui/joy";
import { FC, ReactNode } from "react";

interface Props {
  title: string;
  value: string | ReactNode;
}

export const TitleAndValue: FC<Props> = ({ title, value }) => {
  return (
    <Flex y gap1>
      <Typography textColor="neutral.400" level="body-xs">
        {title}
      </Typography>
      <Typography textColor="neutral.600">{value}</Typography>
    </Flex>
  );
};
