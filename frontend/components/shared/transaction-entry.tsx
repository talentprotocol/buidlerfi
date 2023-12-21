import { useUserContext } from "@/contexts/userContext";
import { useGetTransactions } from "@/hooks/useTransaction";
import { useUsdPrice } from "@/hooks/useUsdPrice";
import { formatToDisplayString, getDifference, shortAddress } from "@/lib/utils";
import { Box, Link as JoyLink, Typography } from "@mui/joy";
import Link from "next/link";
import { FC, useMemo } from "react";
import { UserGroupAvatars } from "./avatar-group";
import { Flex } from "./flex";

type Transaction = NonNullable<ReturnType<typeof useGetTransactions>["data"]>[number];

interface Props {
  transaction: Transaction;
  feeType: "price" | "fee";
  type: "your" | "global";
}

export const TransactionEntry: FC<Props> = ({ transaction, type, feeType }) => {
  const { user } = useUserContext();
  const other = useMemo(
    () => (user?.id === transaction.holder?.id ? transaction.owner : transaction.holder),
    [transaction.holder, transaction.owner, user?.id]
  );
  const timeDiff = getDifference(new Date(Number(transaction.timestamp) * 1000));

  const { formattedString } = useUsdPrice({ ethAmountInWei: transaction.ethCost || BigInt(0) });
  return (
    <Flex x px={2} pb={2} gap1>
      <UserGroupAvatars
        user1={type === "global" ? transaction.holder : other}
        user2={type === "global" ? transaction.owner : undefined}
      />
      <Flex y basis="100%">
        <Typography level="body-sm">
          <JoyLink
            component={Link}
            href={`/profile/${transaction.holder?.wallet}`}
            sx={{
              fontWeight: 600,
              color: theme => theme.palette.text.primary + " !important",
              ":hover": { textDecoration: "none !important" }
            }}
          >
            {user?.id === transaction.holder?.id
              ? "you"
              : transaction.holder?.displayName || shortAddress(transaction.holder?.wallet || "")}
          </JoyLink>{" "}
          {transaction.amount > 0
            ? `bought ${user?.id !== transaction.owner?.id ? "a" : ""}`
            : `sold ${user?.id !== transaction.owner?.id ? "a" : ""}`}{" "}
          <JoyLink
            component={Link}
            href={`/profile/${transaction.owner?.wallet}`}
            sx={{
              fontWeight: 600,
              color: theme => theme.palette.text.primary + " !important",
              ":hover": { textDecoration: "none !important" }
            }}
          >
            {user?.id === transaction.owner?.id
              ? "your"
              : `${transaction.owner?.displayName || shortAddress(transaction.owner?.wallet || "")}`}
          </JoyLink>{" "}
          key
        </Typography>
        {transaction.ethCost !== null && (
          <Typography className="remove-text-transform" level="body-sm">
            {feeType === "price" ? (
              <>
                <Box sx={{ display: "inline", color: transaction.amount >= 0 ? "primary.500" : undefined }}>
                  {formatToDisplayString(transaction.ethCost)} ETH
                </Box>{" "}
                (${formattedString}) • {timeDiff}
              </>
            ) : (
              <>
                <Box sx={{ display: "inline", color: "primary.500" }}>
                  + {formatToDisplayString(transaction.ownerFee || 0)} ETH{" "}
                </Box>
                in fees • {timeDiff}
              </>
            )}
          </Typography>
        )}
      </Flex>
    </Flex>
  );
};
