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
                aboutMe
                skillTags
                realName
                countryName
                company
                school
                websites
                starRating
              }
              badges {
                name
                icon
              }
              submitStats {
                acSubmissionNum { difficulty count }
                totalSubmissionNum { difficulty count }
              }
              tagProblemCounts {
                advanced { tagName problemsSolved }
                intermediate { tagName problemsSolved }
                fundamental { tagName problemsSolved }
              }
              userCalendar {
                streak
                totalActiveDays
                activeYears
              }
              languageProblemCount {
                languageName
                problemsSolved
              }
            }
            recentSubmissionList(username: $username, limit: 10) {
              title
              statusDisplay
              lang
              timestamp
            }
            userContestRanking(username: $username) {
              rating
              globalRanking
              topPercentage
              attendedContestsCount
            }
            userContestRankingHistory(username: $username) {
              contest { title startTime }
              rating
              ranking
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
      const contestHistory = response.data?.data?.userContestRankingHistory || [];
      const recentSubmissionListRaw = response.data?.data?.recentSubmissionList || [];

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

    const totalSubmissions = user.submitStats.totalSubmissionNum.reduce(
      (acc: any, item: any) => {
        acc[item.difficulty.toLowerCase()] = item.count;
        return acc;
      },
      {}
    );

    // Parse language stats
    const languages = (user.languageProblemCount || []).map((l: any) => ({
      name: l.languageName,
      problemsSolved: l.problemsSolved,
    }));

    // Parse top tags (combine all categories)
    const allTags = [
      ...(user.tagProblemCounts?.fundamental || []),
      ...(user.tagProblemCounts?.intermediate || []),
      ...(user.tagProblemCounts?.advanced || []),
    ]
      .sort((a: any, b: any) => b.problemsSolved - a.problemsSolved)
      .slice(0, 10)
      .map((t: any) => ({ tag: t.tagName, count: t.problemsSolved }));

    // Parse recent submissions (top-level query, not nested in matchedUser)
      const recentSubmissions = recentSubmissionListRaw.map((s: any) => ({
      title: s.title,
      status: s.statusDisplay,
      language: s.lang,
      timestamp: new Date(parseInt(s.timestamp) * 1000).toISOString(),
    }));

    // Parse contest history into growth points
    const history = contestHistory
      .filter((c: any) => c.rating > 0)
      .map((c: any) => ({
        date: new Date(c.contest.startTime * 1000).toISOString().split("T")[0],
        score: Math.round(c.rating),
        contestName: c.contest.title,
        ranking: c.ranking,
      }));

    // Parse calendar for streak info
    const calendar = user.userCalendar || {};

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

      // Acceptance rate data
      totalSubmissions: (totalSubmissions.all || 0),

      // Rich Fields
      avatar: user.profile.userAvatar,
      contestRating: Math.round(contest?.rating || 0),
      globalRanking: contest?.globalRanking || user.profile.ranking,
      topPercentage: contest?.topPercentage || 0,
      reputation: user.profile.reputation || 0,
      contestsAttended: contest?.attendedContestsCount || 0,
      title: contest?.rating
        ? contest.rating > 2000
          ? "Guardian"
          : contest.rating > 1600
          ? "Knight"
          : "Member"
        : "Member",

      // New enhanced fields
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      badges: (user.badges || []).map((b: any) => ({ name: b.name, icon: b.icon })),
      languages,
      topTags: allTags,
      recentSubmissions,
        skillTags: user.profile.skillTags || [],
        aboutMe: user.profile.aboutMe || "",
        realName: user.profile.realName || "",
        country: user.profile.countryName || "",
        company: user.profile.company || "",
        school: user.profile.school || "",
        websites: user.profile.websites || [],

        history,
    };
  } catch (err: any) {
    console.error("LEETCODE SERVICE ERROR:", err.message);
    throw err;
  }
}
