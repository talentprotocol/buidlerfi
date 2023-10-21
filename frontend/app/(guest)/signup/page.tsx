"use client";

import { Flex } from "@/components/shared/flex";
import { NavWeb3Button } from "@/components/shared/nav-web3-button";
import { useGetUser } from "@/hooks/useUserApi";
import { LOGO } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export default function Signup() {
  const { address } = useAccount();
  const user = useGetUser(address);

  const handleSignin = () => {
    //Fetch user info from DB
    //If user exists, redirect to /dashboard
    //If user doesn't exist, continue signup flow
  };

  useEffect(() => {
    if (user.isLoading) return;

    if (!user || (user.isError && address)) {
      redirect("/signup/invitation");
    }
  }, [address, user]);

  return (
    <Flex y ysb xc height="300px">
      <Flex y xc gap2>
        <Image alt="App logo" src={LOGO} height={40} width={150} />
        <Typography level="body-sm" textColor="neutral.500">
          Monetize your alpha and network
        </Typography>
      </Flex>

      <Flex y xc gap3>
        <Button size="lg" onClick={() => handleSignin}>
          Sign in
        </Button>
        {/* temporary */}
        <NavWeb3Button />
      </Flex>
    </Flex>
  );
}
