import { Button, ButtonProps, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  sx?: SxProps;
  title?: string;
  variant?: ButtonProps["variant"];
  icon: React.ReactNode;
  onClick: ButtonProps["onClick"];
}

export const RoundButton: FC<Props> = ({ sx, title, icon, variant, onClick }) => {
  return (
    <Flex y gap1 xc>
      <Button variant={variant} sx={{ borderRadius: "25px", width: "50px", height: "50px", ...sx }} onClick={onClick}>
        {icon}
      </Button>
      {title && (
        <Typography textColor="primary.500" level="body-xs">
          {title}
        </Typography>
      )}
    </Flex>
  );
};
