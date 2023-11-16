"use client";
import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  return (
    <Flex y grow gap2 component={"main"} px={4} py={2}>
      <Typography level="h3">builder.fi is in private alpha!</Typography>
      <Flex y mb={4} mt={2} gap2>
        <Typography level="body-md">Thanks for being an early supporter and helping us test the app.</Typography>
        <Typography level="body-md">
          Now find someone interesting, buy their key and ask them a thoughtful question.
        </Typography>
        <Typography level="body-md">
          Soon you will have invites to share with friends. You can find these codes in the Points tab.
        </Typography>
      </Flex>
      <Button onClick={() => router.push("/home")}>Get started</Button>
      <Typography level="body-sm">
        If you have any feedback, please let us know on Twitter{" "}
        <a href="https://twitter.com/BuilderFi" target="_blank">
          @builderfi
        </a>
      </Typography>
    </Flex>
  );
}
