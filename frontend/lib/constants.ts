import { builderFIV1Abi } from "./abi/BuidlerFiV1";

export const MUMBAI_ADDRESS = "0x7083d3c0B2c031dc62ecD14184eB61B6815b31ED";
export const MANTLE_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const POLYGON_ZKEVM_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const TAIKO_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const LINEA_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const BASE_GOERLI_TESTNET = "0x6A8F7499CB4A07FE88F91a29303c6fD396480dAf";
export const BASE_MAINNET = "0x6b0Cb2eB1F2BE16675E2C54e3556f99652a40D40";
export const BASE_GOERLI_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/francisco-leal/builder-fi-base-testnet";
export const BASE_MAINNET_GRAPH_URL = "https://api.studio.thegraph.com/query/8098/builder-fi/version/latest";
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84531;
export const IN_USE_CHAIN_ID =
  process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET_CHAIN_ID : BASE_TESTNET_CHAIN_ID;
export const BUILDERFI_CONTRACT = {
  address: process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET : BASE_GOERLI_TESTNET,
  abi: builderFIV1Abi
} as const;
export const THE_GRAPH_PAGE_SIZE = 50;
export const MAX_QUESTION_SIZE = 280;

export const FAQ_LINK = "https://www.notion.so/talentprotocol/builder-fi-FAQ-dcebfe7103b34d11aba90de032173b39";
