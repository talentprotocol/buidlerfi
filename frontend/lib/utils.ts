import { AxiosError } from "axios";
import { differenceInMinutes, startOfDay, subDays, subMonths } from "date-fns";

import { URLSearchParams } from "url";
import { formatUnits, parseEther } from "viem";

export const shortAddress = (address?: string) => {
  if (!address) return "";
  return `${address.toLowerCase().slice(0, 6)}...${address.toLowerCase().slice(-4)}`;
};

export const formatEth = (eth?: bigint, decimals = 18) => {
  return `${formatUnits(eth || BigInt(0), decimals)}`;
};

export const encodeQueryData = (data: Record<string, string>) => {
  const ret = [];
  for (const d in data) {
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  }
  return ret.join("&");
};

export const tryParseBigInt = (value?: string | bigint | number) => {
  if (typeof value === "bigint") return value;
  if (!value) return BigInt(0);
  else return BigInt(value);
};

export const toEthNumber = (value?: string | bigint | number, decimals = 18) => {
  return Number(formatEth(tryParseBigInt(value), decimals));
};

export const formatToDisplayString = (value?: string | bigint | number, decimals = 18, significantDigits = 6) => {
  const val = tryParseBigInt(value);
  const nbr = decimals ? Number(formatUnits(val, decimals)) : Number(val);
  return nbr.toLocaleString("en-us", { maximumFractionDigits: significantDigits });
};

export const formatError = (error: unknown) => {
  if (!error) return "";
  let res = "";
  if (typeof error === "object" && "shortMessage" in error) res = error.shortMessage as string;
  else if (typeof error === "string") res = error;
  else if (error instanceof AxiosError) res = error.response?.data.error;
  else if (error instanceof Error) res = error.message;
  else res = JSON.stringify(error);

  return res;
};

export const generateRandomString = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
};

export function buildQueryClauses(query: URLSearchParams) {
  const where: { [key: string]: string } = {};
  const orderBy: { [key: string]: string } = {};

  for (const key of Object.keys(query)) {
    // Assume any param ending in "OrderBy" is for ordering, others are for filtering
    if (key.endsWith("OrderBy")) {
      const field = key.slice(0, -7); // Remove 'OrderBy' from the key
      orderBy[field] = query.get(key) as string;
    } else {
      where[key] = query.get(key) as string;
    }
  }

  return { where, orderBy: Object.keys(orderBy).length ? orderBy : undefined };
}

export function isEVMAddress(str: string) {
  return /^0x[a-fA-F0-9]{40}$/gm.test(str);
}

export const ipfsToURL = (ipfsAddress?: string): string => {
  if (!ipfsAddress) return "";

  //Infura IPFS gateway is not working properly
  if (ipfsAddress.startsWith("https://ipfs.infura.io/")) {
    return ipfsAddress.replace("https://ipfs.infura.io/", "https://cloudflare-ipfs.com/");
  }
  if (ipfsAddress.startsWith("http")) {
    return ipfsAddress;
  }
  return "https://cloudflare-ipfs.com/" + ipfsAddress.replace("://", "/");
};

export function convertParamsToString(searchParams: Record<string, string | number | boolean | undefined>) {
  return Object.entries(searchParams)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join("&");
}

export const getDifference = (date?: Date) => {
  if (!date) return "";
  const minutes = differenceInMinutes(new Date(), date);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
};

export function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
}

export const calculateSharePrice = (supply: number) => {
  if (supply === 0) {
    return 0;
  }

  const sum1 = ((supply - 1) * supply * (2 * supply - 1)) / 6;
  const sum2 = (supply * (supply + 1) * (2 * supply + 1)) / 6;

  return (BigInt(sum2 - sum1) * parseEther("1")) / BigInt(16000);
};

//Sort any item into periods. Param must be any array of items with a createdAt field
export function sortIntoPeriods<T extends { createdAt: Date }>(toSort: T[]) {
  const now = new Date();
  const today = startOfDay(now);
  const lastWeek = subDays(now, 7);
  const lastMonth = subMonths(now, 1);
  const lastYear = subMonths(now, 12);

  const sorted = {
    today: [] as T[],
    "last 7 days": [] as T[],
    "last 30 days": [] as T[],
    "last year": [] as T[],
    "all time": [] as T[]
  };

  toSort.forEach(item => {
    if (item.createdAt > today) sorted["today"].push(item);
    else if (item.createdAt > lastWeek) sorted["last 7 days"].push(item);
    else if (item.createdAt > lastMonth) sorted["last 30 days"].push(item);
    else if (item.createdAt > lastYear) sorted["last year"].push(item);
    else sorted["all time"].push(item);
  });

  return sorted;
}
