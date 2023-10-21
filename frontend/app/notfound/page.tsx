import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";

export default function NotFound() {
  return (
    <Flex y xc yc grow gap3>
      <Typography level="h1">NOT FOUND</Typography>
      <a href="/">
        <Button>Go Home</Button>
      </a>
    </Flex>
  );
}
