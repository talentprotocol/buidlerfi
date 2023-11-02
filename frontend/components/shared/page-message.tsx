import { Typography, useTheme } from "@mui/joy";
import { FC, ReactElement, cloneElement } from "react";
import { Flex } from "./flex";

interface Props {
  title?: string;
  text: string;
  icon: ReactElement;
}

export const PageMessage: FC<Props> = ({ title, text, icon }) => {
  const theme = useTheme();
  return (
    <Flex y yc xc grow gap1 p={2}>
      {cloneElement(icon, { sx: { width: "40px", height: "40px", color: theme.palette.primary[500] } })}
      <Flex y yc xc>
        <Typography level="h4">{title}</Typography>
        <Typography textAlign={"center"} level={"body-md"}>
          {text}
        </Typography>
      </Flex>
    </Flex>
  );
};
