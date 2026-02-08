import axios from "axios";

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

/* ===================== HELPERS ===================== */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function parseDevpostDates(text: string, defaultYear: number): { start: string; end: string } {
  if (!text) return { start: "", end: "" };

  const parts = text.split(" - ");
  if (parts.length !== 2) {
    const d = new Date(text);
    if (!isNaN(d.getTime())) return { start: d.toISOString(), end: d.toISOString() };
    return { start: "", end: "" };
  }

  let endStr = parts[1].trim();
  let startStr = parts[0].trim();

  const yearMatch = endStr.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : String(defaultYear);

  if (!startStr.match(/\d{4}/)) startStr += `, ${year}`;
  if (!endStr.match(/\d{4}/)) endStr += `, ${year}`;

  const start = new Date(startStr);
  const end = new Date(endStr);

  return {
    start: !isNaN(start.getTime()) ? start.toISOString() : "",
    end: !isNaN(end.getTime()) ? end.toISOString() : "",
  };
}

function parseDateRange(text: string, defaultYear: number): { start: string; end: string } {
  try {
    const cleaned = text
      .replace(/(\d+)(st|nd|rd|th)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    const parts = cleaned.split(" - ");
    if (parts.length === 2) {
      const startPart = parts[0].trim();
      const endPart = parts[1].trim();

      const startDate = new Date(`${startPart}, ${defaultYear}`);
      const endDate = new Date(`${endPart}, ${defaultYear}`);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return { start: startDate.toISOString(), end: endDate.toISOString() };
      }
    }

    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return { start: d.toISOString(), end: d.toISOString() };
    }
  } catch {}

  return { start: new Date().toISOString(), end: new Date().toISOString() };
}

/* ===================== DEVFOLIO ===================== */
async function fetchDevfolio(): Promise<Hackathon[]> {
  try {
    const graphqlQuery = `
      query SearchHackathons($status: [String!], $themes: [String!], $type: [String!], $search: String) {
        hackathons(status: $status, themes: $themes, type: $type, search: $search) {
          id name slug status start_date end_date
          location is_online banner_url participating_count
          hashtags { name }
        }
      }
    `;

    const res = await axios.post(
      "https://api.devfolio.co/graphql",
      {
        operationName: "SearchHackathons",
        query: graphqlQuery,
        variables: {
          status: ["open", "upcoming"],
          themes: [],
          type: [],
          search: "",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://devfolio.co",
          Referer: "https://devfolio.co/explore",
          "User-Agent": UA,
        },
        timeout: 15000,
      }
    );

    const items = res.data?.data?.hackathons || [];
    const hackathons: Hackathon[] = [];

    for (const s of items) {
      const isOnline = s.is_online !== false;
      const startDate = s.start_date || "";
      const endDate = s.end_date || "";
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      let status: Hackathon["status"] = "upcoming";
      if (!isNaN(end.getTime()) && now > end) status = "ended";
      else if (!isNaN(start.getTime()) && now >= start) status = "open";

      hackathons.push({
        id: `devfolio-${s.slug || s.id}`,
        name: s.name || "Unknown Hackathon",
        tagline: "",
        url: `https://devfolio.co/hackathons/${s.slug}`,
        source: "devfolio" as const,
        startDate: startDate ? new Date(startDate).toISOString() : "",
        endDate: endDate ? new Date(endDate).toISOString() : "",
        location: s.location || (isOnline ? "Online" : "TBD"),
        mode: isOnline ? "online" : "in-person",
        logo: s.banner_url || "",
        themes: Array.isArray(s.hashtags)
          ? s.hashtags.map((t: any) => t.name || "")
          : [],
        participants: s.participating_count || undefined,
        status,
      });
    }

    return hackathons;
  } catch (err: any) {
    console.error("Devfolio fetch error:", err.message);
    return [];
  }
}

/* ===================== MLH ===================== */
async function fetchMLH(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
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
      try {
        const now = new Date();
        const year = now.getFullYear();
        const spd = h.submission_period_dates || "";
        const parsed = parseDevpostDates(spd, year);
        const startDate = parsed.start;
        const endDate = parsed.end;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const validStart = startDate && !isNaN(start.getTime());
        const validEnd = endDate && !isNaN(end.getTime());
        let status: Hackathon["status"] = "upcoming";
        if (validEnd && now > end) status = "ended";
        else if (validStart && now >= start) status = "open";

        hackathons.push({
          id: `devpost-${h.id || h.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: h.title || "Unknown",
          tagline: h.tagline || "",
          url: h.url || "",
          source: "devpost",
          startDate: validStart ? start.toISOString() : "",
          endDate: validEnd ? end.toISOString() : "",
          location:
            h.displayed_location?.location ||
            (h.open_state === "open" ? "Online" : "TBD"),
          mode: h.online ? "online" : "in-person",
          logo: h.thumbnail_url || "",
          themes: h.themes?.map((t: any) => t.name) || [],
          prizes: h.prize_amount ? stripHtml(h.prize_amount) : undefined,
          participants: h.registrations_count || undefined,
          status,
        });
      } catch {
        // skip malformed entry
      }
    }
  } catch (err: any) {
    console.error("Devpost fetch error:", err.message);
  }

  return hackathons;
}

/* ===================== MAIN EXPORT ===================== */

let cachedHackathons: Hackathon[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getAllHackathons(
  forceRefresh = false,
  location?: string
): Promise<Hackathon[]> {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedHackathons.length > 0 &&
    now - cacheTimestamp < CACHE_TTL
  ) {
    return filterByLocation(cachedHackathons, location);
  }

  const [devfolio, mlh, devpost] = await Promise.all([
    fetchDevfolio(),
    fetchMLH(),
    fetchDevpost(),
  ]);

  const all = [...devfolio, ...mlh, ...devpost];

  all.sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  cachedHackathons = all.filter((h) => h.status !== "ended");
  cacheTimestamp = now;

  return filterByLocation(cachedHackathons, location);
}

function filterByLocation(hackathons: Hackathon[], location?: string): Hackathon[] {
  if (!location || location.toLowerCase() === "all") return hackathons;
  const loc = location.toLowerCase();
  return hackathons.filter(
    (h) =>
      h.location.toLowerCase().includes(loc) ||
      h.mode === "online"
  );
}
