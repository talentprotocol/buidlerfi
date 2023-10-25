import { GRAPH_URL } from "@/lib/constants";
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
    shareParticipants(first: 100) {
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
  shareRelationships(where: {holder_: {owner: $address}}) {
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
