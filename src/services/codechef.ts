import axios from "axios";
import * as cheerio from "cheerio";

interface GrowthPoint {
    date: string;
    score: number;
    contestCode?: string;
    contestName?: string;
    rank?: number;
    ratingChange?: number;
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                },
                timeout: 15000,
            });
            return response;
        } catch (err: any) {
            if (err.response?.status === 429 && attempt < maxRetries - 1) {
                const delay = (attempt + 1) * 2000;
                console.log(`[CodeChef] Rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
}

function calculateStars(rating: number): number {
    if (rating >= 2500) return 7;
    if (rating >= 2200) return 6;
    if (rating >= 2000) return 5;
    if (rating >= 1800) return 4;
    if (rating >= 1600) return 3;
    if (rating >= 1400) return 2;
    return 1;
}

export async function getCodeChefUser(username: string) {
    username = username.trim();

    try {
        const response = await fetchWithRetry(
            `https://www.codechef.com/users/${username}`
        );

        const $ = cheerio.load(response.data);
        const html = response.data as string;
        const pageText = $("body").text();

        // Validate user exists
        if (pageText.includes("Page Not Found") || pageText.includes("404")) {
            throw new Error("CodeChef user not found");
        }

        const handle = username;

        // --- Current Rating (primary selector) ---
        let rating = parseInt($(".rating-number").first().text().trim()) || 0;

        // Fallback: regex on page text
        if (rating === 0) {
            const m = pageText.match(/Rating[\s:]+(\d{3,4})/i);
            if (m) rating = parseInt(m[1]);
        }

        // --- Highest Rating ---
        let maxRating = 0;
        const highestText = $(".rating-header small").text();
        const highestMatch = highestText.match(/(\d{3,4})/);
        if (highestMatch) {
            maxRating = parseInt(highestMatch[1]);
        }
        if (!maxRating) {
            const m = pageText.match(/Highest\s+Rating[\s:]+(\d{3,4})/i);
            if (m) maxRating = parseInt(m[1]);
        }
        if (!maxRating) maxRating = rating;

        // --- Stars ---
        let stars = 0;
        const starText = $(".rating-star").text().trim() || $(".rating-header .rating").text().trim();
        const starMatch = starText.match(/(\d)/);
        if (starMatch) {
            stars = parseInt(starMatch[1]);
        }
        if (!stars) {
            const starClass = $("[class*='rating-star']").attr("class") || "";
            const classMatch = starClass.match(/star(\d)/i);
            if (classMatch) stars = parseInt(classMatch[1]);
        }
        // Fallback: derive from rating
        if (!stars && rating > 0) {
            stars = calculateStars(rating);
        }

        // --- Problems Solved ---
        let problemsSolved = 0;
        const problemsMatch = pageText.match(/Total\s+Problems?\s+Solved[\s:]+(\d+)/i)
            || pageText.match(/Problems?\s+Solved[\s:]+(\d+)/i);
        if (problemsMatch) {
            problemsSolved = parseInt(problemsMatch[1]);
        }

        // --- Ranks ---
        let globalRank = 0;
        let countryRank = 0;

        // Primary: .rating-ranks selectors
        const globalRankEl = $(".rating-ranks .inline-list li:nth-child(1) strong").text().trim();
        const countryRankEl = $(".rating-ranks .inline-list li:nth-child(2) strong").text().trim();
        if (globalRankEl) globalRank = parseInt(globalRankEl) || 0;
        if (countryRankEl) countryRank = parseInt(countryRankEl) || 0;

        // Fallback: iterate li elements
        if (!globalRank || !countryRank) {
            $(".rating-ranks li").each((_, el) => {
                const text = $(el).text().toLowerCase();
                const value = parseInt($(el).find("strong").text()) || 0;
                if (!globalRank && text.includes("global")) globalRank = value;
                else if (!countryRank && text.includes("country")) countryRank = value;
            });
        }

        // Fallback: regex
        if (!globalRank) {
            const m = pageText.match(/Global\s+Rank[\s:]+(\d+)/i);
            if (m) globalRank = parseInt(m[1]);
        }
        if (!countryRank) {
            const m = pageText.match(/Country\s+Rank[\s:]+(\d+)/i);
            if (m) countryRank = parseInt(m[1]);
        }

        // --- Country ---
        let country = $(".user-country-name").text().trim();
        if (!country) {
            const countryHref = $(".rating-ranks a[href*='filterBy=Country']").attr("href") || "";
            const m = countryHref.match(/filterBy=Country%3D([^&]+)/);
            if (m) country = decodeURIComponent(m[1]).replace(/\+/g, " ");
        }

        // --- Division ---
        let division = "";
        const divMatch = pageText.match(/Division[\s:]+(\d)/i);
        if (divMatch) {
            division = `Div ${divMatch[1]}`;
        } else {
            const sideDiv = $(".side-nav__division, .rating-data-info").text();
            const m = sideDiv.match(/Div\s*(\d)/i);
            if (m) division = `Div ${m[1]}`;
        }
        if (!division && rating > 0) {
            division = rating >= 2000 ? "Div 1" : rating >= 1600 ? "Div 2" : "Div 3";
        }

        // --- Avatar ---
        const avatarUrl = $(".user-details-container img, .user-avatar img").attr("src")
            || html.match(/https?:\/\/[^"'\s]+\.(?:jpg|png|jpeg)/i)?.[0];

        // --- Institution ---
        let institution = "";
        const instEl = $(".user-details-container .user-institution, .institution").text().trim();
        if (instEl) {
            institution = instEl;
        } else {
            const instMatch = pageText.match(/Institution[\s:]+([^\n]+)/i);
            if (instMatch) institution = instMatch[1].trim();
        }

        // --- Real Name ---
        let realName = "";
        const nameEl = $(".user-details-container h1, .h2-style").first().text().trim();
        if (nameEl && nameEl.toLowerCase() !== username.toLowerCase()) {
            realName = nameEl;
        }

        // --- Rating History (from embedded script: var all_rating = [...]) ---
        const history: GrowthPoint[] = [];
        const contestHistory: GrowthPoint[] = [];
        const scriptMatch = html.match(/var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/);
        if (scriptMatch) {
            try {
                const parsed = JSON.parse(scriptMatch[1]);
                if (Array.isArray(parsed)) {
                    let prevRating = 0;
                    for (const entry of parsed) {
                        const dateStr = entry.end_date || entry.getdate ||
                            (entry.getyear != null && entry.getmonth != null && entry.getday != null
                                ? `${entry.getyear}-${String(entry.getmonth + 1).padStart(2, "0")}-${String(entry.getday).padStart(2, "0")}`
                                : null);
                        const score = parseInt(entry.rating) || 0;
                        if (dateStr && score > 0) {
                            const point: GrowthPoint = {
                                date: dateStr,
                                score,
                                contestCode: entry.code || undefined,
                                contestName: entry.name || entry.code || undefined,
                                rank: parseInt(entry.rank) || undefined,
                                ratingChange: prevRating > 0 ? score - prevRating : undefined,
                            };
                            history.push({ date: dateStr, score });
                            contestHistory.push(point);
                            prevRating = score;
                        }
                    }
                }
            } catch (e) {
                console.warn("[CodeChef] Failed to parse all_rating JSON:", (e as Error).message);
            }
        }

        // --- Contest count ---
        const contestsAttended = contestHistory.length;

        // --- Heatmap data (from embedded script: var defined_heatmap = [...]) ---
        const heatMap: Array<{ date: string; count: number }> = [];
        const heatmapMatch = html.match(/var\s+defined_heatmap\s*=\s*(\{[\s\S]*?\});/)
            || html.match(/var\s+submission_count\s*=\s*(\{[\s\S]*?\});/);
        if (heatmapMatch) {
            try {
                const parsed = JSON.parse(heatmapMatch[1]);
                for (const [date, count] of Object.entries(parsed)) {
                    if (typeof count === "number" && count > 0) {
                        heatMap.push({ date, count });
                    }
                }
            } catch (e) {
                // ignore heatmap parse errors
            }
        }

        // --- Total active days & current streak from heatmap ---
        const totalActiveDays = heatMap.length;
        let streak = 0;
        if (heatMap.length > 0) {
            const sortedDates = heatMap.map(h => h.date).sort().reverse();
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                streak = 1;
                for (let i = 1; i < sortedDates.length; i++) {
                    const prev = new Date(sortedDates[i - 1]).getTime();
                    const curr = new Date(sortedDates[i]).getTime();
                    if (prev - curr <= 86400000 * 1.5) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        if (rating === 0 && problemsSolved === 0) {
            console.warn(`[CodeChef] Parsed page but found no data for ${username}. Possible layout change.`);
        }

        return {
            handle,
            platform: "codechef" as const,
            rating: rating || 0,
            maxRating: maxRating || 0,
            stars: stars || 0,
            globalRank: globalRank || 0,
            countryRank: countryRank || 0,
            problemsSolved: problemsSolved || 0,
            country: country || "Unknown",
            avatar: avatarUrl,
            division: division || "Unknown",
            title: `${stars || calculateStars(rating)} ★ ${division || ""}`.trim(),
            history,
            // Enhanced fields
            contestHistory,
            contestsAttended,
            institution: institution || "",
            realName: realName || "",
            heatMap,
            totalActiveDays,
            streak,
        };
    } catch (err: any) {
        console.error("CODECHEF SERVICE ERROR:", err.message);

        if (err.response?.status === 404) {
            throw new Error("CodeChef user not found");
        } else if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
            throw new Error("CodeChef request timeout - please try again");
        } else if (err.code === "ENOTFOUND") {
            throw new Error("Cannot reach CodeChef - check internet connection");
        }

        throw new Error(err.message || "Failed to fetch CodeChef user data");
    }
}
