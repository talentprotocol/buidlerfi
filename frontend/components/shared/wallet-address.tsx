import { shortAddress } from "@/lib/utils";
import { ContentCopy } from "@mui/icons-material";
import { IconButton, Typography, TypographySystem } from "@mui/joy";
import { FC } from "react";
import { toast } from "react-toastify";
import { Flex } from "./flex";

interface Props {
  address: string;
  level?: "inherit" | keyof TypographySystem;
  removeCopyButton?: boolean;
}

export const WalletAddress: FC<Props> = ({ address, level, removeCopyButton = false }) => {
  return (
    <Flex x yc gap1>
      <Typography level={level}>{shortAddress(address)}</Typography>
      {!removeCopyButton && (
        <IconButton
          size="sm"
          onClick={() => {
            window.navigator.clipboard.writeText(address);
            toast.success("Copied address to clipboard");
          }}
        >
          <ContentCopy sx={{ fontSize: "0.9rem" }} />
        </IconButton>
      )}
    </Flex>
  );
};
