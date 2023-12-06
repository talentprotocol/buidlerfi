import { parseEther } from "viem";
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
export const GRAPH_URL =
  process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET_GRAPH_URL : BASE_GOERLI_GRAPH_URL;
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84531;
export const IN_USE_CHAIN_ID =
  process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET_CHAIN_ID : BASE_TESTNET_CHAIN_ID;
export const BUILDERFI_CONTRACT = {
  address: process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET : BASE_GOERLI_TESTNET,
  abi: builderFIV1Abi
} as const;
export const THE_GRAPH_PAGE_SIZE = 50;
export const MIN_QUESTION_LENGTH = 10;
export const MAX_QUESTION_LENGTH = 280;

// NON-APP CONSTANTS
export const FAQ_LINK = "https://www.notion.so/talentprotocol/builder-fi-FAQ-dcebfe7103b34d11aba90de032173b39";
export const TWITTER_LINK = "https://twitter.com/builderfi";
export const WAITLIST_LINK = "https://builder.fi";
export const INTRO_BLOG_POST_LINK = "https://paragraph.xyz/@builderfi/intro-builderfi";
export const ONBOARDING_WALLET_CREATED_KEY = "onboarding-wallet-created";
export const MIN_BALANCE_ONBOARDING = parseEther("0.001");

// FARCASTER
export const NEW_BUILDERFI_QUESTION_CAST =
  "@{questionAuthor} just asked @{questionRecipient} a question on builder.fi!\n\n{link}";
export const NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH = "0x311091ebeef4e0ba4cbbeb5c7d7f46019a747c06";

export const NEW_BUILDERFI_ANSWER_CAST =
  "@{replyAuthor} just answered @{questionAuthor} question on builder.fi!\n\n{link}";
export const NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH = "0x311091ebeef4e0ba4cbbeb5c7d7f46019a747c06";

export const NEW_BUILDERFI_USER_CAST = "@{user} just launched their keys on builder.fi!\n\n{link}";
export const NEW_BUILDERFI_USER_PARENT_CAST_HASH = "0x203126fea3987996b1032f72ed70d28c9f5663c5";
