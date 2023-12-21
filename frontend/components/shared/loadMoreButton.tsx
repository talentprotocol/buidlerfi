import { Button } from "@mui/joy";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Flex } from "./flex";

interface Props {
  query?: {
    hasNextPage?: boolean;
    fetchNextPage: () => void;
    isLoading: boolean;
    isFetching: boolean;
  };
}

export const LoadMoreButton: FC<Props> = ({ query }) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !query?.isLoading && !query?.isFetching) {
      query?.fetchNextPage();
    }
  }, [inView, query]);

  if (!query?.hasNextPage) return <></>;

  return (
    <Flex x xc ref={ref} py={2}>
      <Button variant="plain" loading={query.isLoading || query.isFetching} onClick={() => query.fetchNextPage()}>
        Load More
      </Button>
    </Flex>
  );
};
