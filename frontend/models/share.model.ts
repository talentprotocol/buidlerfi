export interface Share {
  id: string;
  owner: `0x${string}`;
  supply: number;
  numberOfHolders: number;
  numberOfHoldings: number;
  buyPrice: bigint;
  sellPrice: bigint;
  tradingFeesAmount: bigint;
}
