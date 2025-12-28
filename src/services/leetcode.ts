import axios from "axios";

export interface LeetCodeUser {
  username: string;
  totalSolved: number;
}

export async function getLeetCodeUser(username: string): Promise<LeetCodeUser> {
  try {
    const query = {
      operationName: "getUserProfile",
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username }
    };

    const { data } = await axios.post("https://leetcode.com/graphql", query, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!data?.data?.matchedUser) {
      throw new Error("User not found");
    }

    const acSubmissions = data.data.matchedUser.submitStats.acSubmissionNum;

    // Total solved = sum of all difficulties
    const totalSolved = acSubmissions.reduce((sum: number, item: any) => sum + item.count, 0);

    return { username, totalSolved };
  } catch (err: any) {
    console.error(err.message);
    throw new Error("Failed to fetch LeetCode data — maybe username is wrong");
  }
}
