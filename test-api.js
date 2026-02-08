async function main() {
  try {
    const r = await fetch("http://localhost:5000/api/metrics/codeforces/tourist");
    const d = await r.json();
    console.log("=== CODEFORCES ===");
    console.log("Keys:", Object.keys(d));
    console.log("handle:", d.handle, "rating:", d.rating, "maxRating:", d.maxRating);
    console.log("languages:", d.languages?.length, "recentSubs:", d.recentSubmissions?.length);
    console.log("contestsAttended:", d.contestsAttended, "country:", d.country);
  } catch(e) { console.error("CF error:", e.message); }

  try {
    const r = await fetch("http://localhost:5000/api/metrics/leetcode/neal_wu");
    const d = await r.json();
    console.log("\n=== LEETCODE ===");
    console.log("Keys:", Object.keys(d));
    console.log("handle:", d.handle, "totalSolved:", d.totalSolved);
    console.log("languages:", d.languages?.length, "topTags:", d.topTags?.length);
    console.log("streak:", d.streak, "badges:", d.badges?.length);
    console.log("contestRating:", d.contestRating, "error:", d.error);
  } catch(e) { console.error("LC error:", e.message); }

  try {
    const r = await fetch("http://localhost:5000/api/metrics/codechef/aryanc403");
    const d = await r.json();
    console.log("\n=== CODECHEF ===");
    console.log("Keys:", Object.keys(d));
    console.log("handle:", d.handle, "rating:", d.rating, "stars:", d.stars);
    console.log("division:", d.division, "country:", d.country);
  } catch(e) { console.error("CC error:", e.message); }
}
main();
