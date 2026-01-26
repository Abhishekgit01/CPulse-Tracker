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
              userAvatar
              reputation
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          userContestRanking(username: $username) {
            rating
            globalRanking
            topPercentage
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
    const contest = response.data?.data?.userContestRanking;

    if (!user) {
      throw new Error("LeetCode user not found");
    }

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

      // Rich Fields
      avatar: user.profile.userAvatar,
      contestRating: Math.round(contest?.rating || 0),
      globalRanking: contest?.globalRanking || user.profile.ranking,
      topPercentage: contest?.topPercentage || 0,
      reputation: user.profile.reputation || 0,
      title: contest?.rating ? (contest.rating > 2000 ? "Guardian" : contest.rating > 1600 ? "Knight" : "Member") : "Member",

      history: [], // LeetCode has no historical API
    };

  } catch (err: any) {
    console.error("LEETCODE SERVICE ERROR:", err.message);
    throw err;
  }
}
