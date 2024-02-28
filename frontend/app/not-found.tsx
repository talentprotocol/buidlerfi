import { Flex } from "@/components/shared/flex";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";

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
