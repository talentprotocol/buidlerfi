import axios from "axios";

const getTalent = async (wallet: string) => {
  const requestURL = `${process.env.NEXT_TALENT_PROTOCOL_API_BASE_URL}/talents/${wallet}`;
  return await axios.get(requestURL);
};

export default getTalent;
