import { ethers } from "hardhat";
import * as BuilderFiV1Artifact from "../artifacts/contracts/BuilderFiV1.sol/BuilderFiV1.json";
const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);

  const factory = new ethers.Contract("0xa902DA7a40a671B84bA3Dd0BdBA6FD9d2D888246", BuilderFiV1Artifact.abi, creator);

  await factory.connect(creator).enableTrading();
}

main()
  .then(() => exit(0))
  .catch(error => {
    console.error(error);
    exit(1);
  });
