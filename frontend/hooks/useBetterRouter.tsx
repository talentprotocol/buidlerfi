import { convertParamsToString } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CustomUrl {
  pathname?: string;
  searchParams?: Record<string, string>;
}

export const useBetterRouter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const nextRouter = useRouter();

  const searchParamsDict = Object.fromEntries(searchParams.entries());

  const formatUrl = useCallback(
    (url: CustomUrl | string, options?: { preserveSearchParams?: boolean }) => {
      if (typeof url === "string") url = { pathname: url, searchParams: {} };
      if (!url.pathname) url.pathname = pathname;
      if (options?.preserveSearchParams) {
        Array.from(searchParams.entries()).forEach(
          ([key, value]) => key && value && ((url as CustomUrl).searchParams![key] = value)
        );
      }
      if (Object.entries(url.searchParams!).length === 0) return url.pathname;
      else return `${url.pathname}?${convertParamsToString(url.searchParams!)}`;
    },
    [pathname, searchParams]
  );

  const replace = useCallback(
    (url: CustomUrl | string, options?: { preserveSearchParams?: boolean }) => {
      const formattedUrl = formatUrl(url, options);
      nextRouter.replace(formattedUrl);
    },
    [formatUrl, nextRouter]
  );

  const push = useCallback(
    (url: CustomUrl | string, options?: { preserveSearchParams?: boolean }) => {
      const formattedUrl = formatUrl(url, options);
      nextRouter.push(formattedUrl);
    },
    [formatUrl, nextRouter]
  );

  return { ...nextRouter, replace, push, searchParams: searchParamsDict };
};
