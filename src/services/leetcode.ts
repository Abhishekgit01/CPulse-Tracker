import axios from "axios";

export async function getLeetCodeUser(username: string) {
  try {
    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    };

    const response = await axios.post(
      "https://leetcode.com/graphql",
      query,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const user = response.data?.data?.matchedUser;

    if (!user) {
      throw new Error("LeetCode user not found");
    }

    const totalSolved = user.submitStats.acSubmissionNum.reduce(
      (sum: number, item: any) => sum + item.count,
      0
    );

    const breakdown = user.submitStats.acSubmissionNum.reduce(
  (acc: any, item: any) => {
    acc[item.difficulty.toLowerCase()] = item.count;
    return acc;
  },
  {}
);

return {
  handle: user.username,
  platform: "leetcode" as const,

  totalSolved:
    (breakdown.easy || 0) +
    (breakdown.medium || 0) +
    (breakdown.hard || 0),

  easySolved: breakdown.easy || 0,
  mediumSolved: breakdown.medium || 0,
  hardSolved: breakdown.hard || 0,

  history: [], // LeetCode has no historical API
};

  } catch (err: any) {
    console.error("LEETCODE SERVICE ERROR:", err.message);
    throw err;
  }
}
