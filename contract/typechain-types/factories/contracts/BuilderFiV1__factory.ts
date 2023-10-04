/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { BuilderFiV1, BuilderFiV1Interface } from "../../contracts/BuilderFiV1";

const _abi = [
  {
    inputs: [],
    name: "CannotSellLastShare",
    type: "error",
  },
  {
    inputs: [],
    name: "FundsTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientPayment",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientShares",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlySharesSubjectCanBuyFirstShare",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "subject",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isBuy",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shareAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "protocolEthAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "subjectEthAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "hodlerEthAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
    ],
    name: "Trade",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
    ],
    name: "builderCardsBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "builder",
        type: "address",
      },
    ],
    name: "builderCardsSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
    ],
    name: "buyShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
    ],
    name: "getBuyPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
    ],
    name: "getBuyPriceAfterFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getSellPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getSellPriceAfterFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hodlerFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolFeeDestination",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sharesSubject",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "sellShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_feeDestination",
        type: "address",
      },
    ],
    name: "setFeeDestination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_feePercent",
        type: "uint256",
      },
    ],
    name: "setHodlerFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_feePercent",
        type: "uint256",
      },
    ],
    name: "setProtocolFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_feePercent",
        type: "uint256",
      },
    ],
    name: "setSubjectFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "subjectFeePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6110748061007e6000396000f3fe60806040526004361061015f5760003560e01c80638e8da06f116100c0578063cedc727711610074578063e5aef9f811610059578063e5aef9f814610391578063f2fde38b146103b1578063fbe53234146103d157600080fd5b8063cedc72771461035b578063d6e6eb9f1461037b57600080fd5b8063a22a5e66116100a5578063a22a5e66146102fb578063a498342114610328578063b51d05341461034857600080fd5b80638e8da06f146102a35780639ae71781146102db57600080fd5b80635a8a764e11610117578063715018a6116100fc578063715018a61461025a5780638546e75f1461026f5780638da5cb5b1461028557600080fd5b80635a8a764e1461021a5780635cf4ee911461023a57600080fd5b80633365dd94116101485780633365dd94146101ad5780634c85b425146101cf5780634ce7957c146101e257600080fd5b80632267a89c1461016457806324dc441d14610197575b600080fd5b34801561017057600080fd5b5061018461017f366004610efd565b6103f1565b6040519081526020015b60405180910390f35b3480156101a357600080fd5b5061018460035481565b3480156101b957600080fd5b506101cd6101c8366004610f27565b61049c565b005b6101cd6101dd366004610f40565b6104a9565b3480156101ee57600080fd5b50600154610202906001600160a01b031681565b6040516001600160a01b03909116815260200161018e565b34801561022657600080fd5b506101cd610235366004610f27565b6107a8565b34801561024657600080fd5b50610184610255366004610f5b565b6107b5565b34801561026657600080fd5b506101cd6108d6565b34801561027b57600080fd5b5061018460045481565b34801561029157600080fd5b506000546001600160a01b0316610202565b3480156102af57600080fd5b506101846102be366004610f7d565b600560209081526000928352604080842090915290825290205481565b3480156102e757600080fd5b506101846102f6366004610efd565b6108ea565b34801561030757600080fd5b50610184610316366004610f40565b60066020526000908152604090205481565b34801561033457600080fd5b506101cd610343366004610f27565b61091f565b6101cd610356366004610efd565b61092c565b34801561036757600080fd5b50610184610376366004610f40565b610c9d565b34801561038757600080fd5b5061018460025481565b34801561039d57600080fd5b506101846103ac366004610f40565b610cc1565b3480156103bd57600080fd5b506101cd6103cc366004610f40565b610d5e565b3480156103dd57600080fd5b506101cd6103ec366004610f40565b610df3565b6000806103fe84846108ea565b90506000670de0b6b3a7640000600254836104199190610fc6565b6104239190610fdd565b90506000670de0b6b3a76400006003548461043e9190610fc6565b6104489190610fdd565b90506000670de0b6b3a7640000600454856104639190610fc6565b61046d9190610fdd565b9050808261047b8587610fff565b6104859190610fff565b61048f9190610fff565b9450505050505b92915050565b6104a4610e2a565b600455565b6001600160a01b038116600090815260066020526040902054801580156104d957506001600160a01b0382163314155b15610510576040517f80843b1700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600061051d8260016107b5565b90506000670de0b6b3a7640000600254836105389190610fc6565b6105429190610fdd565b90506000670de0b6b3a76400006003548461055d9190610fc6565b6105679190610fdd565b90506000670de0b6b3a7640000600454856105829190610fc6565b61058c9190610fdd565b9050808261059a8587611012565b6105a49190611012565b6105ae9190611012565b3410156105e7576040517fcd1c886700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b0386166000908152600560209081526040808320338452909152812080549161061683611025565b90915550506001600160a01b038616600090815260066020526040812080549161063f83611025565b909155507f952ff8d90add9fdeaeb478102d54441cf0cc0cbe53b1d99e51f747cdc8379e5490503387600180888888886106798e86611012565b604080516001600160a01b039a8b168152989099166020890152951515878901526060870194909452608086019290925260a085015260c084015260e08301526101008201529051908190036101200190a16001546040516000916001600160a01b03169085908381818185875af1925050503d8060008114610718576040519150601f19603f3d011682016040523d82523d6000602084013e61071d565b606091505b505090506000876001600160a01b03168460405160006040518083038185875af1925050503d806000811461076e576040519150601f19603f3d011682016040523d82523d6000602084013e610773565b606091505b505090508180156107815750805b61079e57604051634a66f90360e01b815260040160405180910390fd5b5050505050505050565b6107b0610e2a565b600355565b60008083156108105760066107cb600186610fff565b6107d6906002610fc6565b6107e1906001611012565b856107ed600182610fff565b6107f79190610fc6565b6108019190610fc6565b61080b9190610fdd565b610813565b60005b90506000841580156108255750836001145b61089a57600660016108378688611012565b6108419190610fff565b61084c906002610fc6565b610857906001611012565b6108618688611012565b600161086d888a611012565b6108779190610fff565b6108819190610fc6565b61088b9190610fc6565b6108959190610fdd565b61089d565b60005b905060006108ab8383610fff565b9050613e806108c282670de0b6b3a7640000610fc6565b6108cc9190610fdd565b9695505050505050565b6108de610e2a565b6108e86000610e84565b565b6001600160a01b03821660009081526006602052604081205461091890610912908490610fff565b836107b5565b9392505050565b610927610e2a565b600255565b6001600160a01b03821660009081526006602052604090205481811161097e576040517fb4abda3900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6001600160a01b03831660009081526005602090815260408083203384529091529020548211156109db576040517f3999656700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60006109f06109ea8484610fff565b846107b5565b90506000670de0b6b3a764000060025483610a0b9190610fc6565b610a159190610fdd565b90506000670de0b6b3a764000060035484610a309190610fc6565b610a3a9190610fdd565b90506000670de0b6b3a764000060045485610a559190610fc6565b610a5f9190610fdd565b6001600160a01b0388166000908152600560209081526040808320338452909152812080549293508892909190610a97908490610fff565b90915550610aa790508686610fff565b6001600160a01b0388166000908152600660205260408120919091557f952ff8d90add9fdeaeb478102d54441cf0cc0cbe53b1d99e51f747cdc8379e5490339089908988888888610af8858f610fff565b604080516001600160a01b039a8b168152989099166020890152951515878901526060870194909452608086019290925260a085015260c084015260e08301526101008201529051908190036101200190a16000338284610b598789610fff565b610b639190610fff565b610b6d9190610fff565b604051600081818185875af1925050503d8060008114610ba9576040519150601f19603f3d011682016040523d82523d6000602084013e610bae565b606091505b50506001546040519192506000916001600160a01b039091169086908381818185875af1925050503d8060008114610c02576040519150601f19603f3d011682016040523d82523d6000602084013e610c07565b606091505b505090506000896001600160a01b03168560405160006040518083038185875af1925050503d8060008114610c58576040519150601f19603f3d011682016040523d82523d6000602084013e610c5d565b606091505b50509050828015610c6b5750815b8015610c745750805b610c9157604051634a66f90360e01b815260040160405180910390fd5b50505050505050505050565b6001600160a01b0381166000908152600660205260408120546104969060016107b5565b600080610ccd83610c9d565b90506000670de0b6b3a764000060025483610ce89190610fc6565b610cf29190610fdd565b90506000670de0b6b3a764000060035484610d0d9190610fc6565b610d179190610fdd565b90506000670de0b6b3a764000060045485610d329190610fc6565b610d3c9190610fdd565b90508082610d4a8587611012565b610d549190611012565b6108cc9190611012565b610d66610e2a565b6001600160a01b038116610de75760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b610df081610e84565b50565b610dfb610e2a565b6001805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b6000546001600160a01b031633146108e85760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610dde565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80356001600160a01b0381168114610ef857600080fd5b919050565b60008060408385031215610f1057600080fd5b610f1983610ee1565b946020939093013593505050565b600060208284031215610f3957600080fd5b5035919050565b600060208284031215610f5257600080fd5b61091882610ee1565b60008060408385031215610f6e57600080fd5b50508035926020909101359150565b60008060408385031215610f9057600080fd5b610f9983610ee1565b9150610fa760208401610ee1565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761049657610496610fb0565b600082610ffa57634e487b7160e01b600052601260045260246000fd5b500490565b8181038181111561049657610496610fb0565b8082018082111561049657610496610fb0565b60006001820161103757611037610fb0565b506001019056fea2646970667358221220fc05938f89c00a517b4818a547a690c99aced5c64d2f340a5573b7b5443849bf64736f6c63430008130033";

type BuilderFiV1ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: BuilderFiV1ConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class BuilderFiV1__factory extends ContractFactory {
  constructor(...args: BuilderFiV1ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<BuilderFiV1> {
    return super.deploy(overrides || {}) as Promise<BuilderFiV1>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): BuilderFiV1 {
    return super.attach(address) as BuilderFiV1;
  }
  override connect(signer: Signer): BuilderFiV1__factory {
    return super.connect(signer) as BuilderFiV1__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BuilderFiV1Interface {
    return new utils.Interface(_abi) as BuilderFiV1Interface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): BuilderFiV1 {
    return new Contract(address, _abi, signerOrProvider) as BuilderFiV1;
  }
}