import { ethers } from "hardhat";

const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log("Creator: ", creator.address);

  const builderFi = await ethers.deployContract("BuilderFiAlphaV1", [creator.address]);

  console.log("BuilderFi Contract Deployed at " + builderFi.target);

  console.log("BuilderFi address is: ", builderFi.address);
}

main()
  .then(() => exit(0))
  .catch(error => {
    console.error(error);
    exit(1);
  });
