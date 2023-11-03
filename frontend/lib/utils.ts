import { AxiosError } from "axios";
import { formatUnits } from "viem";

export const shortAddress = (address: string) => {
  return `${address.toLowerCase().slice(0, 6)}...${address.toLowerCase().slice(-4)}`;
};

export const formatEth = (eth?: bigint) => {
  return `${formatUnits(eth || BigInt(0), 18)}`;
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

export const formatToDisplayString = (value?: string | bigint | number, decimals = 0) => {
  const val = tryParseBigInt(value);
  const nbr = decimals ? Number(formatUnits(val, decimals)) : Number(val);
  return nbr.toLocaleString("en-us", { maximumFractionDigits: 5 });
};

export const formatError = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error instanceof AxiosError) return error.response?.data.error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
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
