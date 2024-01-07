"use client";

import { Flex } from "@/components/shared/flex";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";

export default function LinkedAccountPage() {
  const {
    user,
    linkGoogle,
    unlinkGoogle,
    linkApple,
    unlinkApple,
    linkTwitter,
    unlinkTwitter,
    linkGithub,
    unlinkGithub,
    linkEmail,
    unlinkEmail
  } = usePrivy();

  const numberOfLinkedAccounts = user?.linkedAccounts.filter(acc => acc.type !== "wallet").length;
  const linkedAccount = ({
    label,
    labelButton,
    isLinked,
    link,
    unlink
  }: {
    label: string;
    labelButton: string;
    isLinked: boolean;
    link: () => void;
    unlink: () => void;
    disable?: boolean;
  }) => {
    return (
      <Flex
        x
        xsb
        p={1.5}
        sx={{
          borderBottom: theme => "1px solid " + theme.palette.neutral[300],
          ":last-of-type": { border: "none" }
        }}
      >
        <Flex y>
          <Typography level="title-sm" fontWeight={"600"}>
            {label}
          </Typography>
          <Typography level="body-sm">{!isLinked ? "not link" : "linked"}</Typography>
        </Flex>
        <Button
          variant="outlined"
          color={isLinked ? "danger" : "neutral"}
          size="sm"
          onClick={() => (isLinked ? unlink() : link())}
          sx={{ ":hover": { filter: "brightness(0.95)" } }}
          disabled={numberOfLinkedAccounts === 1 && isLinked}
        >
          {isLinked ? "unlink " : "link "} {labelButton}
        </Button>
      </Flex>
    );
  };

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar title="Linked account" startItem={<BackButton />} />
      <Flex
        y
        m={2}
        sx={{
          borderRadius: "10px",
          backgroundColor: theme => theme.palette.neutral[100]
        }}
      >
        {linkedAccount({
          label: "Google account",
          labelButton: "Google",
          isLinked: !!user?.google,
          link: linkGoogle,
          unlink() {
            user?.google?.subject && unlinkGoogle(user?.google?.subject);
          }
        })}
        {linkedAccount({
          label: "Apple ID",
          labelButton: "Apple ID",
          isLinked: !!user?.apple,
          link: linkApple,
          unlink: () => user?.apple?.subject && unlinkApple(user?.apple?.subject)
        })}
        {linkedAccount({
          label: "x.com",
          labelButton: "x.com",
          isLinked: !!user?.twitter,
          link: linkTwitter,
          unlink: () => user?.twitter?.username && unlinkTwitter(user?.twitter?.subject)
        })}
        {linkedAccount({
          label: "github",
          labelButton: "github",
          isLinked: !!user?.github,
          link: linkGithub,
          unlink: () => user?.github?.username && unlinkGithub(user?.github?.subject)
        })}
        {linkedAccount({
          label: "email address",
          labelButton: "email",
          isLinked: !!user?.email,
          link: linkEmail,
          unlink: () => user?.email?.address && unlinkEmail(user?.email?.address)
        })}
      </Flex>
    </Flex>
  );
}
