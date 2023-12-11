import { Button } from "@mui/joy";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Flex } from "./flex";

interface Props {
  nextPage: () => void;
  isLoading: boolean;
  hidden?: boolean;
}

export const LoadMoreButton: FC<Props> = ({ nextPage, isLoading, hidden }) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isLoading) {
      nextPage();
    }
  }, [inView]);

  if (hidden) return <></>;

  return (
    <Flex x xc ref={ref} py={2}>
      <Button loading={isLoading} onClick={() => nextPage()}>
        Load More
      </Button>
    </Flex>
  );
};
