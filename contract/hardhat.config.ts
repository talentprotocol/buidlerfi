import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";

import type { HardhatUserConfig } from "hardhat/config";

const deployer = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk"
};

// const deployer = [""];

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: deployer,
      chainId: 44787
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: deployer,
      chainId: 42220
    },
    polygonMumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: deployer,
      chainId: 80001
    },
    polygon: {
      url: "https://polygon-mainnet.infura.io/v3/c01468162cae4441ba6c94ac3ece1cc7",
      accounts: deployer,
      chainId: 137,
      gasMultiplier: 1.5
    },
    // for testnet
    "base-goerli": {
      url: "https://goerli.base.org",
      accounts: deployer,
      chainId: 84531,
      gasMultiplier: 1.1
    },
    base: {
      url: "https://mainnet.base.org/",
      accounts: deployer,
      chainId: 8453,
      gasMultiplier: 1.1
    }
  },
  gasReporter: {
    currency: "ETH"
  },
  etherscan: {
    // Your API keys for Etherscan
    apiKey: {
      celo: process.env.CELO_API_KEY || "",
      alfajores: process.env.CELO_API_KEY || "",
      polygon: process.env.POLYGON_API_KEY || "",
      polygonMumbai: process.env.POLYGON_API_KEY || ""
    },
    // Custom chains that are not supported by default
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io"
        }
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/"
        }
      }
    ]
  }
};

export default config;
