import { convertParamsToString } from "@/lib/utils";
import { isBoolean, isNumber } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface CustomUrl {
  pathname?: string;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

interface BetterRouterOptions {
  // If true, will preserve the current search params
  preserveSearchParams?: boolean;
}

export const useBetterRouter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const nextRouter = useRouter();

  const searchParamsDict = useMemo(() => {
    const entries: Record<string, string> = Object.fromEntries(searchParams.entries());
    const resEntries: Record<string, string | number | boolean> = {};
    Object.keys(entries).forEach(key => {
      if (entries[key] === undefined) {
        return;
      }

      //Try to parse int and booleans
      const val = entries[key];
      if (isNumber(val)) resEntries[key] = Number(val);
      else if (isBoolean(val)) resEntries[key] = val === "true";
      else resEntries[key] = val;
    });
    return resEntries;
  }, [searchParams]);

  const formatUrl = useCallback(
    (url: CustomUrl | string, options?: BetterRouterOptions) => {
      if (typeof url === "string") url = { pathname: url, searchParams: {} };
      if (!url.pathname) url.pathname = pathname;
      if (options?.preserveSearchParams) {
        Array.from(searchParams.entries()).forEach(
          ([key, value]) =>
            key &&
            value &&
            !(key in (url as CustomUrl).searchParams!) &&
            ((url as CustomUrl).searchParams![key] = value)
        );
      }
      //It means it's a relative path. Prepend the current route
      if (url.pathname.startsWith("./")) {
        url.pathname = pathname + url.pathname.substring(1);
      }
      if (Object.entries(url.searchParams!).length === 0) return url.pathname;
      else return `${url.pathname}?${convertParamsToString(url.searchParams!)}`;
    },
    [pathname, searchParams]
  );

  const replace = useCallback(
    (url: CustomUrl | string, options?: BetterRouterOptions) => {
      const formattedUrl = formatUrl(url, options);
      nextRouter.replace(formattedUrl, { scroll: false });
    },
    [formatUrl, nextRouter]
  );

  const push = useCallback(
    (url: CustomUrl | string, options?: BetterRouterOptions) => {
      const formattedUrl = formatUrl(url, options);
      nextRouter.push(formattedUrl, { scroll: false });
    },
    [formatUrl, nextRouter]
  );

  return { ...nextRouter, replace, push, searchParams: searchParamsDict };
};
