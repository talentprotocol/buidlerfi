"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { formatToDisplayString, shortAddress } from "@/lib/utils";
import { ContentCopy, CopyAll, Refresh } from "@mui/icons-material";
import { Button, Card, IconButton, Link, Skeleton, Typography, useTheme } from "@mui/joy";
import NextLink from "next/link";
import { toast } from "react-toastify";

export default function FundPage() {
  const theme = useTheme();
  const router = useBetterRouter();
  const { address, balance, refetchBalance, balanceIsLoading } = useUserContext();
  return (
    <Flex y gap={4}>
      <Flex y>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Get some ETH on Base.
        </Typography>
        <Typography level="body-sm" mt={1}>
          You will use ETH, the official currency of Base, when you buy and sell keys. We recommend adding atleast 0.001
          ETH to your wallet to get started.
        </Typography>
      </Flex>

      <Flex y gap2>
        <Flex x yc xsb component={Card}>
          <Flex x yc gap3>
            <CopyAll fontSize="large" />
            <Flex y gap1>
              <Typography level="title-md">Bridge from Ethereum Mainnet</Typography>
            </Flex>
          </Flex>
          <NextLink href="https://bridge.base.org/deposit" target="_blank">
            <Link>Go to Bridge</Link>
          </NextLink>
        </Flex>

        {address && (
          <Flex x yc xsb component={Card}>
            <Flex x yc gap3>
              <ContentCopy fontSize="large" />
              <Flex y gap1>
                <Typography level="title-md">Receive on Base</Typography>
                <Typography level="body-sm">{shortAddress(address)}</Typography>
              </Flex>
            </Flex>
            <Link
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success("Copied address to clipboard");
              }}
            >
              Copy Address
            </Link>
          </Flex>
        )}
      </Flex>

      <Flex y gap2>
        <Button onClick={() => router.replace({ searchParams: { skipfund: "1" } }, { preserveSearchParams: true })}>
          Continue
        </Button>

        <Flex x yc xc gap1 fullwidth>
          <Typography level="body-sm" textAlign="center">
            <Skeleton loading={balanceIsLoading}>Wallet balance: {formatToDisplayString(balance, 18)} ETH</Skeleton>
          </Typography>
          <IconButton onClick={refetchBalance}>
            <Refresh fontSize="small" htmlColor={theme.palette.neutral[500]} />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
}
