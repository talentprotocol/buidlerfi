import { shortAddress } from "@/lib/utils";
import { ContentCopy } from "@mui/icons-material";
import { IconButton, Typography, TypographySystem } from "@mui/joy";
import { FC } from "react";
import { toast } from "react-toastify";
import { Flex } from "./flex";

interface Props {
  address: string;
  level?: "inherit" | keyof TypographySystem;
}

export const WalletAddress: FC<Props> = ({ address, level }) => {
  return (
    <Flex x yc gap1>
      <Typography level={level}>{shortAddress(address)}</Typography>
      <IconButton
        size="sm"
        onClick={() => {
          window.navigator.clipboard.writeText(address);
          toast.success("Copied address to clipboard");
        }}
      >
        <ContentCopy sx={{ fontSize: "0.9rem" }} />
      </IconButton>
    </Flex>
  );
};
