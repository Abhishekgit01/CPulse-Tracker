import axios from "axios";

const CODEFORCES_API = "https://codeforces.com/api";

export interface CodeforcesUser {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
}

export async function getUserInfo(handle: string): Promise<CodeforcesUser> {
  const response = await axios.get(
    `${CODEFORCES_API}/user.info?handles=${handle}`
  );

  const user = response.data.result[0];

  return {
    handle: user.handle,
    rating: user.rating ?? 0,
    maxRating: user.maxRating ?? 0,
    rank: user.rank ?? "unrated",
    maxRank: user.maxRank ?? "unrated"
  };
}
