import { BUILDERFI_CONTRACT, GRAPH_URL, THE_GRAPH_PAGE_SIZE } from "@/lib/constants";
import { Share } from "@/models/share.model";
import { ShareRelationship } from "@/models/shareRelationship.model";

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
    shareParticipants(first: ${THE_GRAPH_PAGE_SIZE}, orderBy: supply, orderDirection:desc) {
      ${gqlShare}
    }
    shareRelationships(first: ${THE_GRAPH_PAGE_SIZE}) {
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

const getUsersQuery = (offset: number) => `
  {
    shareParticipants(first: ${THE_GRAPH_PAGE_SIZE}, skip: ${offset}, orderBy: supply, orderDirection:desc) {
      ${gqlShare}
    }
  }
`;

const getHoldingsQuery = `
query RelationshipsQuery($address: ID = "owner") {
  shareRelationships(where: {holder_: {owner: $address}, heldKeyNumber_gt: 0}, orderBy: supporterNumber, orderDirection:asc) {
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
  shareRelationships(where: {owner_: {owner: $address}}, orderBy: supporterNumber, orderDirection:asc) {
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

export const fetchUsers = async (offset: number) => {
  const res: BuilderFiDataResponse = await fetch(GRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query: getUsersQuery(offset)
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
