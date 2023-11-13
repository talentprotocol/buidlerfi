import { BASE_GOERLI_GRAPH_URL, BASE_MAINNET_GRAPH_URL, BUILDERFI_CONTRACT } from "@/lib/constants";
import { Share } from "@/models/share.model";
import { ShareRelationship } from "@/models/shareRelationship.model";

const GRAPH_URL =
  process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? BASE_MAINNET_GRAPH_URL : BASE_GOERLI_GRAPH_URL;

const gqlShare = `
  id
  owner
  supply
  numberOfHolders
  numberOfHoldings
  buyPrice
  sellPrice
  tradingFeesAmount
`;

const query = `
  {
    shareParticipants(first: 100, orderBy: supply, orderDirection:desc) {
      ${gqlShare}
    }
    shareRelationships(first: 100) {
      id
      holder {
        ${gqlShare}
      }
      owner {
        ${gqlShare}
      }
      supporterNumber
      heldKeyNumber
    }
  }
`;

const getHoldingsQuery = `
query RelationshipsQuery($address: ID = "owner") {
  shareRelationships(where: {holder_: {owner: $address}, heldKeyNumber_gt: 0}) {
    heldKeyNumber
    id
    supporterNumber
    owner {
      ${gqlShare}
    }
    holder {
      ${gqlShare}
    }
  }
}
`;

const getHoldersQuery = `
query MyQuery($address: ID = "owner") {
  shareRelationships(where: {owner_: {owner: $address}}) {
    heldKeyNumber
    id
    supporterNumber
    owner {
      ${gqlShare}
    }
    holder {
      ${gqlShare}
    }
  }
}
`;

const getContractAnalytic = `
query GetContract($id: ID!) {
  contractAnalytic(id: $id) {
    id
    totalNumberOfBuilders
    totalNumberOfHolders
    totalNumberOfKeys
    totalProtocolFees
    totalBuilderFees
    totalValueLocked
  }
}
`;

interface BuilderFiContractDataResponse {
  data: {
    contractAnalytic: {
      totalNumberOfBuilders: string;
      totalNumberOfHolders: string;
      totalNumberOfKeys: string;
      totalProtocolFees: string;
      totalBuilderFees: string;
      totalValueLocked: string;
      id: string;
    };
  };
}

interface BuilderFiDataResponse {
  data: {
    shareParticipants: Share[];
    shareRelationships: ShareRelationship[];
  };
}

export const fetchBuilderfiData = async () => {
  const res: BuilderFiDataResponse = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json());

  return res.data;
};

interface BuilderFiHoldersResponse {
  data: {
    shareRelationships: ShareRelationship[];
  };
}

export const fetchHoldings = async (address: string) => {
  const res: BuilderFiHoldersResponse = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: getHoldingsQuery,
      variables: {
        address: address.toLowerCase()
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json());

  return res.data.shareRelationships;
};

export const fetchHolders = async (address: string) => {
  const res: BuilderFiHoldersResponse = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: getHoldersQuery,
      variables: {
        address: address.toLowerCase()
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json());

  return res.data.shareRelationships;
};

export const fetchContractData = async () => {
  const res: BuilderFiContractDataResponse = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: getContractAnalytic,
      variables: {
        id: BUILDERFI_CONTRACT.address
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json());
  return res.data.contractAnalytic;
};
