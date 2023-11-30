import axios from "axios";

export const updateRecommendations = async (wallet: string) => {
  if (!process.env.RECOMMENDATION_ENGINE_API || !process.env.RECOMMENDATION_ENGINE_SECRET) {
    return;
  }

  axios.post(
    process.env.RECOMMENDATION_ENGINE_API,
    {
      wallets: [wallet]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Secret": process.env.RECOMMENDATION_ENGINE_SECRET
      }
    }
  );
};
