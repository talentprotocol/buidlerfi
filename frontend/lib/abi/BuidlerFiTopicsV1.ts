export const builderFITopicsV1Abi = [
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_owner",
		  type: "address"
		},
		{
		  internalType: "string[]",
		  name: "topics",
		  type: "string[]"
		},
		{
		  internalType: "address",
		  name: "_poolPrizeReceiver",
		  type: "address"
		},
		{
		  internalType: "address",
		  name: "_protocolFeeDestination",
		  type: "address"
		},
		{
		  internalType: "uint256",
		  name: "_protocolFeePercent",
		  type: "uint256"
		},
		{
		  internalType: "uint256",
		  name: "_builderFeePercent",
		  type: "uint256"
		}
	  ],
	  stateMutability: "nonpayable",
	  type: "constructor"
	},
	{
	  inputs: [],
	  name: "CannotSellLastShare",
	  type: "error"
	},
	{
	  inputs: [],
	  name: "InsufficientPayment",
	  type: "error"
	},
	{
	  inputs: [],
	  name: "InsufficientShares",
	  type: "error"
	},
	{
	  inputs: [],
	  name: "OnlyOwnerCanCreateFirstShare",
	  type: "error"
	},
	{
	  inputs: [],
	  name: "OnlyOwnerCanCreateTopics",
	  type: "error"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: false,
		  internalType: "address",
		  name: "owner",
		  type: "address"
		},
		{
		  indexed: false,
		  internalType: "string",
		  name: "description",
		  type: "string"
		},
		{
		  indexed: false,
		  internalType: "bytes32",
		  name: "topicHash",
		  type: "bytes32"
		}
	  ],
	  name: "NewTopic",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: false,
		  internalType: "address",
		  name: "payee",
		  type: "address"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "amount",
		  type: "uint256"
		}
	  ],
	  name: "Payout",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: false,
		  internalType: "address",
		  name: "payee",
		  type: "address"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "amount",
		  type: "uint256"
		}
	  ],
	  name: "PendingPayout",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: true,
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  indexed: true,
		  internalType: "bytes32",
		  name: "previousAdminRole",
		  type: "bytes32"
		},
		{
		  indexed: true,
		  internalType: "bytes32",
		  name: "newAdminRole",
		  type: "bytes32"
		}
	  ],
	  name: "RoleAdminChanged",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: true,
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  indexed: true,
		  internalType: "address",
		  name: "account",
		  type: "address"
		},
		{
		  indexed: true,
		  internalType: "address",
		  name: "sender",
		  type: "address"
		}
	  ],
	  name: "RoleGranted",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: true,
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  indexed: true,
		  internalType: "address",
		  name: "account",
		  type: "address"
		},
		{
		  indexed: true,
		  internalType: "address",
		  name: "sender",
		  type: "address"
		}
	  ],
	  name: "RoleRevoked",
	  type: "event"
	},
	{
	  anonymous: false,
	  inputs: [
		{
		  indexed: false,
		  internalType: "address",
		  name: "trader",
		  type: "address"
		},
		{
		  indexed: false,
		  internalType: "string",
		  name: "topic",
		  type: "string"
		},
		{
		  indexed: false,
		  internalType: "bytes32",
		  name: "topicHash",
		  type: "bytes32"
		},
		{
		  indexed: false,
		  internalType: "bool",
		  name: "isBuy",
		  type: "bool"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "shareAmount",
		  type: "uint256"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "ethAmount",
		  type: "uint256"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "protocolEthAmount",
		  type: "uint256"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "builderEthAmount",
		  type: "uint256"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "supply",
		  type: "uint256"
		},
		{
		  indexed: false,
		  internalType: "uint256",
		  name: "nextPrice",
		  type: "uint256"
		}
	  ],
	  name: "Trade",
	  type: "event"
	},
	{
	  inputs: [],
	  name: "DEFAULT_ADMIN_ROLE",
	  outputs: [
		{
		  internalType: "bytes32",
		  name: "",
		  type: "bytes32"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_newAdmin",
		  type: "address"
		}
	  ],
	  name: "addAdmin",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "builderFeePercent",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		},
		{
		  internalType: "address",
		  name: "_receiver",
		  type: "address"
		}
	  ],
	  name: "buyShares",
	  outputs: [],
	  stateMutability: "payable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "claimPendingPayouts",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string[]",
		  name: "topicDescriptions",
		  type: "string[]"
		}
	  ],
	  name: "createOpenTopic",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string[]",
		  name: "topicDescriptions",
		  type: "string[]"
		}
	  ],
	  name: "createTopic",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "disableOpenTopic",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "disableTrading",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "enableOpenTopic",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "enableTrading",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		}
	  ],
	  name: "getBuyPrice",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		}
	  ],
	  name: "getBuyPriceAfterFee",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "uint256",
		  name: "supply",
		  type: "uint256"
		},
		{
		  internalType: "uint256",
		  name: "amount",
		  type: "uint256"
		}
	  ],
	  name: "getPrice",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "pure",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		}
	  ],
	  name: "getRoleAdmin",
	  outputs: [
		{
		  internalType: "bytes32",
		  name: "",
		  type: "bytes32"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		},
		{
		  internalType: "uint256",
		  name: "amount",
		  type: "uint256"
		}
	  ],
	  name: "getSellPrice",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		},
		{
		  internalType: "uint256",
		  name: "amount",
		  type: "uint256"
		}
	  ],
	  name: "getSellPriceAfterFee",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		}
	  ],
	  name: "getTopicToBytes32",
	  outputs: [
		{
		  internalType: "bytes32",
		  name: "",
		  type: "bytes32"
		}
	  ],
	  stateMutability: "pure",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  internalType: "address",
		  name: "account",
		  type: "address"
		}
	  ],
	  name: "grantRole",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  internalType: "address",
		  name: "account",
		  type: "address"
		}
	  ],
	  name: "hasRole",
	  outputs: [
		{
		  internalType: "bool",
		  name: "",
		  type: "bool"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "openTopic",
	  outputs: [
		{
		  internalType: "bool",
		  name: "",
		  type: "bool"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "poolPrizeReceiver",
	  outputs: [
		{
		  internalType: "address",
		  name: "",
		  type: "address"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "protocolFeeDestination",
	  outputs: [
		{
		  internalType: "address",
		  name: "",
		  type: "address"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "protocolFeePercent",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_newAdmin",
		  type: "address"
		}
	  ],
	  name: "removeAdmin",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  internalType: "address",
		  name: "account",
		  type: "address"
		}
	  ],
	  name: "renounceRole",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "role",
		  type: "bytes32"
		},
		{
		  internalType: "address",
		  name: "account",
		  type: "address"
		}
	  ],
	  name: "revokeRole",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "string",
		  name: "topic",
		  type: "string"
		},
		{
		  internalType: "address",
		  name: "_receiver",
		  type: "address"
		}
	  ],
	  name: "sellShares",
	  outputs: [],
	  stateMutability: "payable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "uint256",
		  name: "_feePercent",
		  type: "uint256"
		}
	  ],
	  name: "setBuilderFeePercent",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_feeDestination",
		  type: "address"
		}
	  ],
	  name: "setFeeDestination",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "address",
		  name: "_poolPrizeReceiver",
		  type: "address"
		}
	  ],
	  name: "setPoolPrizeReceiver",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "uint256",
		  name: "_feePercent",
		  type: "uint256"
		}
	  ],
	  name: "setProtocolFeePercent",
	  outputs: [],
	  stateMutability: "nonpayable",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes4",
		  name: "interfaceId",
		  type: "bytes4"
		}
	  ],
	  name: "supportsInterface",
	  outputs: [
		{
		  internalType: "bool",
		  name: "",
		  type: "bool"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "",
		  type: "bytes32"
		},
		{
		  internalType: "address",
		  name: "",
		  type: "address"
		}
	  ],
	  name: "topicsKeysBalance",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [
		{
		  internalType: "bytes32",
		  name: "",
		  type: "bytes32"
		}
	  ],
	  name: "topicsKeysSupply",
	  outputs: [
		{
		  internalType: "uint256",
		  name: "",
		  type: "uint256"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	},
	{
	  inputs: [],
	  name: "tradingEnabled",
	  outputs: [
		{
		  internalType: "bool",
		  name: "",
		  type: "bool"
		}
	  ],
	  stateMutability: "view",
	  type: "function"
	}
  ] as const;
  