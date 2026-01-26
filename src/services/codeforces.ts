import axios from "axios";

interface GrowthPoint {
  date: string;
  score: number;
}

export async function getUserInfo(handle: string) {
  // 1️⃣ Fetch basic user info
  const infoRes = await axios.get(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );

  const user = infoRes.data.result[0];

  // 2️⃣ Fetch rating history
  const ratingRes = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );

  const history: GrowthPoint[] = ratingRes.data.result.map((item: any) => ({
    date: new Date(item.ratingUpdateTimeSeconds * 1000)
      .toISOString()
      .split("T")[0],
    score: item.newRating,
  }));

  // 3️⃣ Return normalized data (matches backend + Mongo schema)
  return {
    handle: user.handle,
    platform: "codeforces" as const,
    rating: user.rating,
    maxRating: user.maxRating,
    rank: user.rank,
    maxRank: user.maxRank,

    // Rich Fields
    avatar: user.titlePhoto,
    title: user.rank,
    contribution: user.contribution,
    friendOfCount: user.friendOfCount,
    organization: user.organization || "Independent",
    lastOnlineTimeSeconds: user.lastOnlineTimeSeconds,

    history,
  };
}
