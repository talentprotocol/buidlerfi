import { builderFIV1Abi } from "./abi/BuidlerFiV1";

export const MUMBAI_ADDRESS = "0x7083d3c0B2c031dc62ecD14184eB61B6815b31ED";
export const MANTLE_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const POLYGON_ZKEVM_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const TAIKO_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const LINEA_TESTNET = "0xa013cDBBE8c9b1325992e3D4Fc312bB990cC61F5";
export const BASE_GOERLI_TESTNET = "0x8b35b89ed2df3682b9783db65136211aee8bdd08";
export const GRAPH_URL = "https://api.thegraph.com/subgraphs/name/francisco-leal/builder-fi-base-testnet";
export const BUILDERFI_CONTRACT = {
  address: BASE_GOERLI_TESTNET,
  abi: builderFIV1Abi
} as const;
