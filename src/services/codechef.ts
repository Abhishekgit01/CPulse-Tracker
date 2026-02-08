import axios from "axios";
import * as cheerio from "cheerio";

interface GrowthPoint {
    date: string;
    score: number;
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

export async function getCodeChefUser(username: string) {
    // Trim whitespace from username
    username = username.trim();

    try {
        // 1️⃣ Fetch user profile page
        const response = await fetchWithRetry(
            `https://www.codechef.com/users/${username}`
        );

        // 2️⃣ Parse HTML
        const $ = cheerio.load(response.data);
        const pageText = $("body").text();
        console.log(`[CodeChef Debug] Page text length: ${pageText.length}`);

        // 3️⃣ Validate user exists
        const handle = username;

        // Check if we got a valid profile page
        if (pageText.includes("Page Not Found") || pageText.includes("404")) {
            throw new Error("CodeChef user not found");
        }

        // 4️⃣ Extract data from page text using regex patterns
        let rating = 0;
        let maxRating = 0;
        let stars = 0;
        let problemsSolved = 0;
        let globalRank = 0;
        let countryRank = 0;

        // Extract current rating from various possible patterns
        // Pattern 1: Look for rating in parentheses format like "3355 (-47)"
        const ratingPattern1 = /(\d{3,4})\s*\([\+\-]?\d+\)/;
        const ratingMatch1 = pageText.match(ratingPattern1);
        if (ratingMatch1) {
            rating = parseInt(ratingMatch1[1]);
        }

        // Pattern 2: Look for "Rating: XXXX" or similar
        if (rating === 0) {
            const ratingPattern2 = /Rating[\s:]+(\d{3,4})/i;
            const ratingMatch2 = pageText.match(ratingPattern2);
            if (ratingMatch2) {
                rating = parseInt(ratingMatch2[1]);
            }
        }

        // Extract highest rating if mentioned
        const maxRatingPattern = /Highest\s+Rating[\s:]+(\d{3,4})/i;
        const maxRatingMatch = pageText.match(maxRatingPattern);
        if (maxRatingMatch) {
            maxRating = parseInt(maxRatingMatch[1]);
        } else {
            maxRating = rating; // Default to current rating
        }

        // Extract stars (look for .rating-star or the broad text)
        let starsFound = 0;

        // Strategy A: Direct selector
        const starText = $(".rating-star").text().trim();
        const starMatch = starText.match(/(\d)\s*[★⭐]/i) || pageText.match(/(\d)\s*[★⭐]/i) || pageText.match(/(\d)\s*Star/i);

        if (starMatch) {
            starsFound = parseInt(starMatch[1]);
        }

        // Strategy B: Class name check (CodeChef often uses class star1, star2, etc.)
        if (starsFound === 0) {
            const starClass = $("[class*='rating-star']").attr("class") || "";
            const classMatch = starClass.match(/star(\d)/i);
            if (classMatch) starsFound = parseInt(classMatch[1]);
        }

        stars = starsFound;

        // Extract problems solved - this appears as "Total Problems Solved: XXX"
        const problemsPattern = /Total\s+Problems\s+Solved[\s:]+(\d+)/i;
        const problemsMatch = pageText.match(problemsPattern);
        if (problemsMatch) {
            problemsSolved = parseInt(problemsMatch[1]);
        }

        // Alternative pattern for problems
        if (problemsSolved === 0) {
            const problemsPattern2 = /Problems\s+Solved[\s:]+(\d+)/i;
            const problemsMatch2 = pageText.match(problemsPattern2);
            if (problemsMatch2) {
                problemsSolved = parseInt(problemsMatch2[1]);
            }
        }

        // Extract global rank and country rank specifically from .rating-ranks
        $(".rating-ranks li").each((_, el) => {
            const text = $(el).text().toLowerCase();
            const value = parseInt($(el).find("strong").text()) || 0;

            if (text.includes("global rank")) {
                globalRank = value;
            } else if (text.includes("country rank")) {
                countryRank = value;
            }
        });

        // Extract global rank (fallback if selectors fail)
        if (globalRank === 0) {
            const globalRankPattern = /Global\s+Rank[\s:]+(\d+)/i;
            const globalRankMatch = pageText.match(globalRankPattern);
            if (globalRankMatch) globalRank = parseInt(globalRankMatch[1]);
        }

        // Extract country rank (fallback if selectors fail)
        if (countryRank === 0) {
            const countryRankPattern = /Country\s+Rank[\s:]+(\d+)/i;
            const countryRankMatch = pageText.match(countryRankPattern);
            if (countryRankMatch) countryRank = parseInt(countryRankMatch[1]);
        }

        // Extract Country Name
        let country = "";
        country = $(".user-country-name").text().trim();
        if (!country) {
            // Try from rank link title or text
            const countryLink = $(".rating-ranks a[href*='filterBy=Country']").text();
            if (countryLink.includes("Country Rank")) {
                // Sometimes it says "Country Rank (India)"
                const match = countryLink.match(/\(([^)]+)\)/);
                if (match) country = match[1];
            }
        }

        // Fallback for country rank Link
        if (!country) {
            const countryHref = $(".rating-ranks a[href*='filterBy=Country']").attr("href") || "";
            const countryMatch = countryHref.match(/filterBy=Country%3D([^&]+)/);
            if (countryMatch) country = decodeURIComponent(countryMatch[1]).replace(/\+/g, " ");
        }

        // 8️⃣ Validate that we got at least some data
        // Check if there's a user header, which indicates the user page loaded correctly
        const userHeader = $('h1.h2-style').text().trim();
        if (rating === 0 && problemsSolved === 0 && !userHeader) {
            // Instead of throwing, just return empty state - better than 500 error
            console.warn(`[CodeChef] Parsed page but found no data for ${username}. Possible layout change.`);
        }

        // Extract Division
        let division = "Div ? ";
        const divMatch = pageText.match(/Division[\s:]+(\d)/i);
        if (divMatch) {
            division = `Div ${divMatch[1]}`;
        } else {
            // Check in breadcrumbs or titles
            const sideDiv = $(".side-nav__division, .rating-data-info").text();
            const divMatch2 = sideDiv.match(/Div\s*(\d)/i);
            if (divMatch2) division = `Div ${divMatch2[1]}`;
        }

        // Extract Avatar
        const avatarUrl = $(".user-details-container img, .user-avatar img").attr("src")
            || pageText.match(/https?:\/\/[^"'\s]+\.jpg/i)?.[0];

        // 9️⃣ Return normalized data (matches backend + Mongo schema)
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

            // Rich Fields
            avatar: avatarUrl,
            division: division,
            title: `${stars} ★ ${division}`,

            history: [] as GrowthPoint[],
        };
    } catch (err: any) {
        console.error("CODECHEF SERVICE ERROR:", err.message);
        console.error("Error details:", {
            code: err.code,
            status: err.response?.status,
            statusText: err.response?.statusText,
        });

        // Provide specific error messages
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
