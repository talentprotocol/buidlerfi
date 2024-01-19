import { BUILDERFI_CONTRACT } from "@/lib/constants";
import viemClient from "@/lib/viemClient";
import assert from "node:assert";
import test from "node:test";

const testSourceAddress = "0xccdb5043087a5d4a8598a73fe1d789a130c5cb4c";
const testTargetAddress = "0x1CC54C72dD81C93f672661f9b7262266D844831D";

test("Should calculate gas fees correctly", async () => {
  const buyPriceAfterFee = await viemClient.readContract({
    abi: BUILDERFI_CONTRACT.abi,
    address: BUILDERFI_CONTRACT.address,
    functionName: "getBuyPriceAfterFee",
    args: [testTargetAddress]
  });

  const gasLimit = await viemClient.estimateContractGas({
    abi: BUILDERFI_CONTRACT.abi,
    functionName: "buyShares",
    args: [testTargetAddress],
    address: BUILDERFI_CONTRACT.address,
    account: testSourceAddress,
    value: buyPriceAfterFee
  });

  console.log({ gasLimit });
  assert.notEqual(gasLimit, 0n);

  await test("Transaction does not reject", async () => {
    await assert.doesNotReject(async () => {
      viemClient.simulateContract({
        abi: BUILDERFI_CONTRACT.abi,
        functionName: "buyShares",
        args: [testTargetAddress],
        address: BUILDERFI_CONTRACT.address,
        account: testSourceAddress,
        value: buyPriceAfterFee
      });
    });
  });
});
