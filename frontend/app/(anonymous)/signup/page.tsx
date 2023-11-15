"use client";

import { Flex } from "@/components/shared/flex";
import { useGetContractData } from "@/hooks/useBuilderFiApi";
import { LOGO } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

export default function Signup() {
  const { login } = usePrivy();
  const contractData = useGetContractData();

  const batchNumber = () => {
    const numberOfBuilders = BigInt(contractData.data?.totalNumberOfBuilders || 0);
    if (numberOfBuilders < 100n) {
      return 1;
    } else if (numberOfBuilders < 500n) {
      return 2;
    } else if (numberOfBuilders < 1000n) {
      return 3;
    } else if (numberOfBuilders < 3000n) {
      return 4;
    }
    {
      return "5+";
    }
  };
  const batchCount = () => {
    const number = batchNumber();
    if (number === 1) {
      return "100";
    } else if (number === 2) {
      return "500";
    } else if (number === 3) {
      return "1,000";
    } else if (number === 4) {
      return "3,000";
    } else {
      return "10,000";
    }
  };

  return (
    <Flex y ysb xc height="300px">
      <Flex y xc gap2>
        <Image alt="App logo" src={LOGO} height={40} width={150} />
        <Typography level="body-sm" textColor="neutral.500">
          Monetize your knowledge,
          <br />
          support the next builders.
        </Typography>
      </Flex>

      <Flex y xc gap3>
        <Button size="lg" onClick={() => login()}>
          Sign in
        </Button>
        <Flex y xc>
          <Typography level="body-sm" textColor="neutral.500">
            Batch {"#"}
            {batchNumber()}
          </Typography>
          <Typography level="body-sm" textColor="neutral.500">
            {contractData.data?.totalNumberOfBuilders}/{batchCount()} builders
          </Typography>
        </Flex>
      </Flex>
    </Flex>
  );
}
