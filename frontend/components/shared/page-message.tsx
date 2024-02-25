import Typography from "@mui/joy/Typography";
import { useTheme } from "@mui/joy/styles/ThemeProvider";
import { SxProps } from "@mui/joy/styles/types";
import { FC, ReactElement, ReactNode, cloneElement } from "react";
import { Flex } from "./flex";

interface Props {
  title?: string;
  text: string | ReactNode;
  icon: ReactElement;
  sx?: SxProps;
}

export const PageMessage: FC<Props> = ({ title, text, icon, sx }) => {
  const theme = useTheme();
  return (
    <Flex y yc xc grow gap1 p={2} sx={sx}>
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
