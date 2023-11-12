import { ethers } from "hardhat";
import * as BuilderFiAlphaV1 from "../../artifacts/contracts/BuilderFiAlphaV1.sol/BuilderFiAlphaV1.json";
const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org/");
  const feeData = await provider.getFeeData();
  const contract = new ethers.Contract("0x7e82c2965716E0dc8e789A7Fb13d6B4BAfD565A7", BuilderFiAlphaV1.abi, creator);

  await contract.setFeeDestination("0x68cD449ac4008DFD1E008aA253Cb5f139631a8D4", {
    gasPrice: feeData.gasPrice?.mul(2)
  });

  console.log("BuilderFi fee destination set");
  await contract
    .connect(creator)
    .setProtocolFeePercent(ethers.utils.parseUnits("0.05"), { gasPrice: feeData.gasPrice?.mul(2) }); // 5%
  await contract
    .connect(creator)
    .setBuilderFeePercent(ethers.utils.parseUnits("0.05"), { gasPrice: feeData.gasPrice?.mul(2) }); // 5%

  console.log("BuilderFi percents set");
  await contract.connect(creator).enableTrading({ gasPrice: feeData.gasPrice?.mul(2) });
  console.log("all done");
}

main()
  .then(() => exit(0))
  .catch(error => {
    console.error(error);
    exit(1);
  });
