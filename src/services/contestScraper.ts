import axios from "axios";
import { Contest } from "../models/Contest";

interface CodeforcesContest {
    id: number;
    name: string;
    type: string;
    phase: "BEFORE" | "CODING" | "FINISHED" | "PENDING_SYSTEM_TEST";
    durationSeconds: number;
    startTimeSeconds?: number;
}

interface CodeChefContest {
    contest_code: string;
    contest_name: string;
    contest_start_date: string;
    contest_end_date: string;
    contest_start_date_iso: string;
    contest_end_date_iso: string;
}

/**
 * Fetch contests from Codeforces API
 */
export async function fetchCodeforcesContests() {
    try {
        const response = await axios.get<{ status: string; result: CodeforcesContest[] }>(
            "https://codeforces.com/api/contest.list"
        );

        if (response.data.status !== "OK") {
            throw new Error("Codeforces API returned non-OK status");
        }

        const contests = response.data.result
            .filter((c) => c.phase === "BEFORE" && c.startTimeSeconds) // Only upcoming contests
            .map((c) => ({
                name: c.name,
                platform: "codeforces" as const,
                startTime: new Date(c.startTimeSeconds! * 1000),
                duration: c.durationSeconds,
                url: `https://codeforces.com/contest/${c.id}`,
                phase: c.phase,
                type: c.type,
                externalId: c.id.toString(),
            }));

        return contests;
    } catch (error: any) {
        console.error("Error fetching Codeforces contests:", error.message);
        return [];
    }
}

/**
 * Fetch contests from CodeChef API
 */
export async function fetchCodeChefContests() {
    try {
        const response = await axios.get<{
            present_contests: CodeChefContest[];
            future_contests: CodeChefContest[];
        }>("https://www.codechef.com/api/list/contests/all");

        const futureContests = response.data.future_contests || [];

        const contests = futureContests.map((c) => {
            const startTime = new Date(c.contest_start_date_iso);
            const endTime = new Date(c.contest_end_date_iso);
            const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

            return {
                name: c.contest_name,
                platform: "codechef" as const,
                startTime,
                duration: durationSeconds,
                url: `https://www.codechef.com/${c.contest_code}`,
                phase: "BEFORE" as const,
                externalId: c.contest_code,
            };
        });

        return contests;
    } catch (error: any) {
        console.error("Error fetching CodeChef contests:", error.message);
        return [];
    }
}

/**
 * Fetch contests from LeetCode GraphQL API
 */
export async function fetchLeetCodeContests() {
    try {
        const query = `
      query allContests {
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;

        const response = await axios.post<{
            data: {
                allContests: Array<{
                    title: string;
                    titleSlug: string;
                    startTime: number;
                    duration: number;
                }>;
            };
        }>("https://leetcode.com/graphql", {
            query,
            variables: {},
        });

        const now = Date.now() / 1000;
        const allContests = response.data?.data?.allContests || [];

        const contests = allContests
            .filter((c) => c.startTime > now) // Only future contests
            .map((c) => ({
                name: c.title,
                platform: "leetcode" as const,
                startTime: new Date(c.startTime * 1000),
                duration: c.duration,
                url: `https://leetcode.com/contest/${c.titleSlug}`,
                phase: "BEFORE" as const,
                externalId: c.titleSlug,
            }));

        return contests;
    } catch (error: any) {
        console.error("Error fetching LeetCode contests:", error.message);
        return [];
    }
}

/**
 * Update database with latest contests from all platforms
 */
export async function updateAllContests() {
    try {
        console.log("🔄 Fetching contests from all platforms...");

        const [cfContests, ccContests, lcContests] = await Promise.all([
            fetchCodeforcesContests(),
            fetchCodeChefContests(),
            fetchLeetCodeContests(),
        ]);

        const allContests = [...cfContests, ...ccContests, ...lcContests];

        console.log(`📊 Fetched ${allContests.length} total contests`);
        console.log(`  - Codeforces: ${cfContests.length}`);
        console.log(`  - CodeChef: ${ccContests.length}`);
        console.log(`  - LeetCode: ${lcContests.length}`);

        // Upsert contests (update if exists, insert if new)
        let upsertedCount = 0;
        for (const contestData of allContests) {
            await Contest.findOneAndUpdate(
                { platform: contestData.platform, externalId: contestData.externalId },
                contestData,
                { upsert: true, new: true }
            );
            upsertedCount++;
        }

        console.log(`✅ Upserted ${upsertedCount} contests to database`);

        // Clean up old finished contests (older than 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const deleteResult = await Contest.deleteMany({
            startTime: { $lt: sevenDaysAgo },
        });

        console.log(`🗑️  Deleted ${deleteResult.deletedCount} old contests`);

        return {
            fetched: allContests.length,
            upserted: upsertedCount,
            deleted: deleteResult.deletedCount,
        };
    } catch (error: any) {
        console.error("❌ Error updating contests:", error.message);
        throw error;
    }
}
