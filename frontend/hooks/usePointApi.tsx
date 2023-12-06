import { getCurrentPositionSA } from "@/backend/point/pointServerAction";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuerySA } from "./useQuerySA";

export function useGetCurrentPosition(queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetCurrentPosition"], options => getCurrentPositionSA(options), {
    ...queryOptions
  });
}
