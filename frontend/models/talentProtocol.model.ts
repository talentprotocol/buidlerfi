export interface GetTalentResponse {
  talent: {
    about: string;
    banner_url: string;
    email: string;
    headline: string;
    id: string;
    location: string;
    name: string;
    occupation: string;
    profile_picture_url: string;
    subscribers_count: number;
    subscribing_count: number;
    supporters_count: number;
    supporting_count: number;
    ticker: string;
    username: string;
    verified: boolean;
    wallet_address: string;
  };
}
