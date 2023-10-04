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

interface BuilderFiDataResponse {
  data: {
    shareParticipants: Share[];
    shareRelationships: ShareRelationship[];
  };
}

export const fetchBuilderfiData = async () => {
  const res: BuilderFiDataResponse = await fetch(
    "https://api.thegraph.com/subgraphs/name/francisco-leal/buidlerfi-eth-singapore",
    {
      method: "POST",
      body: JSON.stringify({
        query
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  ).then(res => res.json());

  return res.data;
};
