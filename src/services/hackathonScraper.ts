import axios from "axios";
import * as cheerio from "cheerio";

export interface Hackathon {
  id: string;
  name: string;
  tagline: string;
  url: string;
  source: "devfolio" | "mlh" | "devpost";
  startDate: string;
  endDate: string;
  location: string;
  mode: "online" | "in-person" | "hybrid";
  logo?: string;
  themes: string[];
  prizes?: string;
  participants?: number;
  applyBy?: string;
  status: "upcoming" | "open" | "ended";
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/* ===================== DEVFOLIO ===================== */
async function fetchDevfolio(): Promise<Hackathon[]> {
  try {
    // Devfolio internal GraphQL - may break if schema changes
    const res = await axios.post(
      "https://api.devfolio.co/api/search/hackathons",
      {
        type: "hackathon",
        q: "",
        filter: "open",
        sort_by: "date",
        page: 0,
        per_page: 20,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": UA,
        },
        timeout: 10000,
      }
    );

    const hits = res.data?.hits?.hits || [];
    return hits.map((hit: any) => {
      const s = hit._source || {};
      const isOnline = s.is_online !== false;
      const startDate = s.starts_at || s.start_date || "";
      const endDate = s.ends_at || s.end_date || "";
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      let status: Hackathon["status"] = "upcoming";
      if (now > end) status = "ended";
      else if (now >= start) status = "open";

      return {
        id: `devfolio-${s.slug || hit._id}`,
        name: s.name || "Unknown Hackathon",
        tagline: s.tagline || "",
        url: `https://devfolio.co/hackathons/${s.slug}`,
        source: "devfolio" as const,
        startDate,
        endDate,
        location: s.location || (isOnline ? "Online" : "TBD"),
        mode: isOnline ? "online" : "in-person",
        logo: s.logo || "",
        themes: s.themes || [],
        prizes: s.prize_amount ? `$${s.prize_amount}` : undefined,
        status,
      };
    });
  } catch (err: any) {
    console.error("Devfolio fetch error:", err.message);
    return [];
  }
}

/* ===================== MLH ===================== */
async function fetchMLH(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    // MLH season page - scrape upcoming events
    const year = new Date().getFullYear();
    const res = await axios.get(`https://mlh.io/seasons/${year}/events`, {
      headers: { "User-Agent": UA },
      timeout: 10000,
    });

    const $ = cheerio.load(res.data);

    $(".event-wrapper .card").each((_i, el) => {
      const name = $(el).find(".event-name, h3").text().trim();
      const dateText = $(el).find(".event-date, .date").text().trim();
      const locationText = $(el).find(".event-location, .location").text().trim();
      const link = $(el).find("a").attr("href") || "";
      const logo = $(el).find("img").attr("src") || "";
      const isDigital =
        locationText.toLowerCase().includes("digital") ||
        locationText.toLowerCase().includes("online") ||
        locationText.toLowerCase().includes("virtual");

      if (!name) return;

      // Parse date range like "Jan 10th - 12th, 2026"
      const { start, end } = parseDateRange(dateText, year);

      const now = new Date();
      const startD = new Date(start);
      const endD = new Date(end);
      let status: Hackathon["status"] = "upcoming";
      if (now > endD) status = "ended";
      else if (now >= startD) status = "open";

      hackathons.push({
        id: `mlh-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        tagline: "",
        url: link.startsWith("http") ? link : `https://mlh.io${link}`,
        source: "mlh",
        startDate: start,
        endDate: end,
        location: locationText || "TBD",
        mode: isDigital ? "online" : "in-person",
        logo,
        themes: [],
        status,
      });
    });
  } catch (err: any) {
    console.error("MLH fetch error:", err.message);
  }

  return hackathons;
}

/* ===================== DEVPOST ===================== */
async function fetchDevpost(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await axios.get(
      "https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&order_by=deadline",
      {
        headers: { "User-Agent": UA, Accept: "application/json" },
        timeout: 10000,
      }
    );

    const items = res.data?.hackathons || [];
    for (const h of items.slice(0, 25)) {
      const now = new Date();
      const start = new Date(h.submission_period_dates?.split(" - ")[0] || h.start_date || "");
      const end = new Date(h.submission_period_dates?.split(" - ")[1] || h.end_date || "");
      let status: Hackathon["status"] = "upcoming";
      if (now > end) status = "ended";
      else if (now >= start) status = "open";

      hackathons.push({
        id: `devpost-${h.id || h.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: h.title || "Unknown",
        tagline: h.tagline || "",
        url: h.url || "",
        source: "devpost",
        startDate: h.start_date || start.toISOString(),
        endDate: h.end_date || end.toISOString(),
        location: h.displayed_location?.location || (h.open_state === "open" ? "Online" : "TBD"),
        mode: h.online ? "online" : "in-person",
        logo: h.thumbnail_url || "",
        themes: h.themes?.map((t: any) => t.name) || [],
        prizes: h.prize_amount || undefined,
        participants: h.registrations_count || undefined,
        status,
      });
    }
  } catch (err: any) {
    console.error("Devpost fetch error:", err.message);
  }

  return hackathons;
}

/* ===================== HELPERS ===================== */
function parseDateRange(text: string, defaultYear: number): { start: string; end: string } {
  try {
    // Handle formats like "Jan 10th - 12th, 2026" or "Feb 7 - 9, 2026"
    const cleaned = text
      .replace(/(\d+)(st|nd|rd|th)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    const parts = cleaned.split(" - ");
    if (parts.length === 2) {
      const startPart = parts[0].trim();
      const endPart = parts[1].trim();

      // Try direct parse
      const startDate = new Date(`${startPart}, ${defaultYear}`);
      const endDate = new Date(`${endPart}, ${defaultYear}`);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        };
      }
    }

    // Fallback: try parsing full text
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return { start: d.toISOString(), end: d.toISOString() };
    }
  } catch {}

  return { start: new Date().toISOString(), end: new Date().toISOString() };
}

/* ===================== MAIN EXPORT ===================== */

let cachedHackathons: Hackathon[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getAllHackathons(forceRefresh = false): Promise<Hackathon[]> {
  const now = Date.now();

  if (!forceRefresh && cachedHackathons.length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return cachedHackathons;
  }

  // Fetch from all sources in parallel
  const [devfolio, mlh, devpost] = await Promise.all([
    fetchDevfolio(),
    fetchMLH(),
    fetchDevpost(),
  ]);

  const all = [...devfolio, ...mlh, ...devpost];

  // Sort by start date (soonest first), filter out ended
  all.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  cachedHackathons = all.filter((h) => h.status !== "ended");
  cacheTimestamp = now;

  return cachedHackathons;
}
