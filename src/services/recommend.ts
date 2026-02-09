import axios from "axios";

export interface CFProblem {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
}

export async function getRecommendations(handle: string, userRating: number) {
    try {
        // 1. Fetch user status (submissions)
        const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        const solved = new Set<string>();

        if (statusRes.data.status === "OK") {
            statusRes.data.result.forEach((sub: any) => {
                if (sub.verdict === "OK") {
                    solved.add(`${sub.problem.contestId}${sub.problem.index}`);
                }
            });
        }

        // 2. Fetch all problems
        const problemsetRes = await axios.get("https://codeforces.com/api/problemset.problems");
        if (problemsetRes.data.status !== "OK") {
            throw new Error("Failed to fetch CF problemset");
        }

        const allProblems: CFProblem[] = problemsetRes.data.result.problems;

        // 3. Filter: Unsolved, within rating range [userRating + 100, userRating + 300]
        const candidates = allProblems.filter(p => {
            const id = `${p.contestId}${p.index}`;
            return !solved.has(id) &&
                p.rating &&
                p.rating >= userRating + 100 &&
                p.rating <= userRating + 300;
        });

        // 4. Sort by rating (hardest first to give quality candidates) and pick top 20 for AI to choose from
        candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        return candidates.slice(0, 20);
    } catch (error: any) {
        console.error("CF RECOMMEND ERROR:", error.message);
        return [];
    }
}
