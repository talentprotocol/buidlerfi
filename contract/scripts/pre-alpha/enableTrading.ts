import { ethers } from "hardhat";
import * as BuilderFiV1Artifact from "../../artifacts/contracts/BuilderFiV1.sol/BuilderFiV1.json";
const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);
  const provider = new ethers.providers.JsonRpcProvider("https://goerli.base.org");
  const feeData = await provider.getFeeData();
  const factory = new ethers.Contract("0x8b35b89ed2df3682b9783db65136211aee8bdd08", BuilderFiV1Artifact.abi, creator);

  await factory.setFeeDestination("0x33041027dd8F4dC82B6e825FB37ADf8f15d44053", { gasPrice: feeData.gasPrice?.mul(2) });

  console.log("BuilderFi fee destination set");
  await factory.setHodlerFeePercent(ethers.utils.parseUnits("0.05"), { gasPrice: feeData.gasPrice?.mul(2) }); // 5%
  await factory.setProtocolFeePercent(ethers.utils.parseUnits("0.05"), { gasPrice: feeData.gasPrice?.mul(2) }); // 5%
  await factory.setSubjectFeePercent(ethers.utils.parseUnits("0.05"), { gasPrice: feeData.gasPrice?.mul(2) }); // 5%

  console.log("BuilderFi percents set");
  await factory.connect(creator).enableTrading({ gasPrice: feeData.gasPrice?.mul(2) });
  console.log("all done");
}

main()
  .then(() => exit(0))
  .catch(error => {
    console.error(error);
    exit(1);
  });
