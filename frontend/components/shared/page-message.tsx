import { Typography } from "@mui/joy";
import { FC, ReactElement, cloneElement } from "react";
import { Flex } from "./flex";

interface Props {
  title?: string;
  text: string;
  icon: ReactElement;
}

export const PageMessage: FC<Props> = ({ title, text, icon }) => {
  return (
    <Flex y yc xc grow gap1 p={2}>
      {cloneElement(icon, { sx: { width: "40px", height: "40px", color: "primary.500" } })}
      <Flex y yc xc>
        <Typography fontWeight={600} level="h4" textColor="neutral.800">
          {title}
        </Typography>
        <Typography textAlign={"center"} textColor="neutral.500" level={"body-md"}>
          {text}
        </Typography>
      </Flex>
    </Flex>
  );
};
