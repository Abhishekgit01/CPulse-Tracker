async function main() {
  // Test with recentSubmissionList as separate query
  try {
    const r = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query getUserProfile($username: String!) {
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
          }`,
        variables: { username: "neal_wu" }
      })
    });
    console.log("Status:", r.status);
    const t = await r.text();
    console.log("Response:", t.substring(0, 2000));
  } catch(e) { console.error("Error:", e.message); }
}
main();
