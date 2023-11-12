import { ethers } from "hardhat";
import * as BuilderFiAlphaV1 from "../../artifacts/contracts/BuilderFiAlphaV1.sol/BuilderFiAlphaV1.json";
const { exit } = process;

async function main() {
  const [creator] = await ethers.getSigners();
  console.log(creator.address);
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org/");
  const feeData = await provider.getFeeData();
  const contract = new ethers.Contract("0xd7b907aD64E23593561c852F74ca4fc7ed0b3fAf", BuilderFiAlphaV1.abi, creator);

  await contract.setFeeDestination("0x6e42d3f06CcA58e33cDFCfF74ec66FC0cA1D80aa", {
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
