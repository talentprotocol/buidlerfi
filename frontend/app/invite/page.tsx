import { TitleAndValue } from "@/components/app/invite/titleAndValue";
import { Flex } from "@/components/shared/flex";
import { CardGiftcard } from "@mui/icons-material";
import { Typography } from "@mui/joy";

export default function Invite() {
  const points = 9;
  const leaderboardPosition = 1000;
  const invitedAmount = 5;
  const inviteCode = "bf-test-123441";
  return (
    <Flex y xc px={4}>
      <CardGiftcard sx={{ fontSize: "150px" }} />
      <Typography textAlign="center" textColor="neutral.400" level="body-lg">
        Points are airdropped every Friday and will have future uses in BuilderFi
      </Typography>

      <Flex y xs gap3 alignSelf="flex-start" mt={8}>
        <TitleAndValue title="Your unique invite code" value={inviteCode} />
        <TitleAndValue title="Your points" value={points} />
        <TitleAndValue title="Weekly leaderboard" value={`# ${leaderboardPosition}`} />
        <TitleAndValue title="Invited people" value={invitedAmount} />
      </Flex>
    </Flex>
  );
}
