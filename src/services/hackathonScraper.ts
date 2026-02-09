import axios from "axios";
const cheerio = require("cheerio");

export interface Hackathon {
  id: string;
  name: string;
  tagline: string;
  url: string;
  source: "devfolio" | "mlh" | "devpost" | "unstop";
  startDate: string;
  endDate: string;
  location: string;
  mode: "online" | "in-person" | "hybrid" | string;
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

    $(".event-wrapper .card").each((_i: number, el: any) => {
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

/* ===================== UNSTOP ===================== */
async function fetchUnstop(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await axios.post(
      "https://unstop.com/api/public/opportunity/search-new",
      {
        opportunity: ["hackathons"],
        oppstatus: ["open", "recent"],
        size: 25,
        page: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": UA,
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    const items = res.data?.data?.data || [];
    for (const h of items) {
      try {
        const name = h.title || h.name || "Unknown";
        const slug = h.public_url || h.seo_url || "";
        const url = slug ? `https://unstop.com/hackathons/${slug}` : "https://unstop.com";
        const logo = h.logoUrl2 || h.logoUrl || h.banner_mobile || "";
        const startDate = h.start_date ? new Date(h.start_date).toISOString() : "";
        const endDate = h.end_date ? new Date(h.end_date).toISOString() : "";
        const regEnd = h.regnRequirements?.end_regn_dt;
        const location = h.festival?.city || h.organisation?.city || "";
        const isOnline = h.filters?.opportunity_type === "online" || !location;

        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        let status: Hackathon["status"] = "upcoming";
        if (endDate && !isNaN(end.getTime()) && now > end) status = "ended";
        else if (startDate && !isNaN(start.getTime()) && now >= start) status = "open";

        const themes: string[] = [];
        if (h.filters?.category) themes.push(h.filters.category);
        if (Array.isArray(h.tags)) {
          for (const t of h.tags.slice(0, 5)) {
            if (typeof t === "string") themes.push(t);
            else if (t?.name) themes.push(t.name);
          }
        }

        hackathons.push({
          id: `unstop-${h.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name,
          tagline: h.subtitle || h.organisation?.name || "",
          url,
          source: "unstop",
          startDate,
          endDate,
          location: location || (isOnline ? "Online" : "TBD"),
          mode: isOnline ? "online" : "in-person",
          logo,
          themes,
          prizes: h.prizes?.length ? h.prizes[0]?.name || "" : undefined,
          participants: h.registerCount || undefined,
          applyBy: regEnd || undefined,
          status,
        });
      } catch {
        // skip malformed entry
      }
    }
  } catch (err: any) {
    console.error("Unstop fetch error:", err.message);
  }

  return hackathons;
}

/* ===================== CURATED BANGALORE HACKATHONS ===================== */
function getCuratedBangaloreHackathons(): Hackathon[] {
  const now = new Date();
  const hackathons: Hackathon[] = [
    // February 2026
    {
      id: "curated-innovation-edu-equity",
      name: "Innovation for Education Equity Hackathon",
      tagline: "Building open-source tools to transform public school leadership (ShikshaLokam)",
      url: "https://shikshalokam.org",
      source: "devpost",
      startDate: "2026-02-05T09:00:00.000Z",
      endDate: "2026-02-06T18:00:00.000Z",
      location: "Bengaluru, India (InvokED 5.0)",
      mode: "in-person",
      themes: ["EdTech", "Open Source", "Social Impact"],
      prizes: "₹4,50,000",
      participants: 200,
      status: "upcoming",
    },
    {
      id: "curated-innov8-4-blr",
      name: "Innov8 4.0",
      tagline: "Multi-track hackathon covering Blockchain, AI/ML, and HealthTech",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-10T09:00:00.000Z",
      endDate: "2026-02-11T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Blockchain", "AI/ML", "HealthTech"],
      prizes: "₹1,00,000+",
      participants: 300,
      status: "upcoming",
    },
    {
      id: "curated-hack-with-gdg-s3",
      name: "Hack With GDG S3",
      tagline: "Google Developer Group hackathon – Cloud, Web & Mobile",
      url: "https://gdg.community.dev/gdg-bangalore/",
      source: "devfolio",
      startDate: "2026-02-13T09:00:00.000Z",
      endDate: "2026-02-14T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Google Cloud", "Web Dev", "Mobile Dev"],
      prizes: "Swags & Mentorship",
      participants: 200,
      status: "upcoming",
    },
    {
      id: "curated-zyph-blr-2026",
      name: "Zyph Hackathon",
      tagline: "Open-theme hackathon with no restrictions – build anything",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-14T09:00:00.000Z",
      endDate: "2026-02-15T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Open Innovation"],
      prizes: "₹50,000+",
      participants: 250,
      status: "upcoming",
    },
    {
      id: "curated-build-india-anthropic-2026",
      name: "Build India: Anthropic x Replit x Lightspeed",
      tagline: "AI-native products purpose-built for India using Claude and Replit – $35K in bounties",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-15T09:00:00.000Z",
      endDate: "2026-02-15T21:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["AI", "Language Diversity", "India-specific Workflows"],
      prizes: "$35,000",
      participants: 500,
      status: "upcoming",
    },
    {
      id: "curated-enigma-26-blr",
      name: "Enigma '26",
      tagline: "Open-theme general tech hackathon in Bengaluru",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-20T09:00:00.000Z",
      endDate: "2026-02-21T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Open Innovation", "Full Stack"],
      prizes: "₹75,000+",
      participants: 300,
      status: "upcoming",
    },
    {
      id: "curated-semixthon-blr",
      name: "SemiXthon",
      tagline: "HealthTech and IoT/Hardware focused hackathon",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-20T09:00:00.000Z",
      endDate: "2026-02-21T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["HealthTech", "IoT", "Hardware"],
      prizes: "₹60,000+",
      participants: 200,
      status: "upcoming",
    },
    {
      id: "curated-codelites-2-blr",
      name: "CodeLites 2.0",
      tagline: "Open-theme coding and hackathon event for all skill levels",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-21T09:00:00.000Z",
      endDate: "2026-02-22T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Open Innovation", "Web Dev"],
      prizes: "₹40,000+",
      participants: 200,
      status: "upcoming",
    },
    {
      id: "curated-gdg-bangalore-build-ai",
      name: "GDG Bangalore: Build with AI Sprint",
      tagline: "Google Developer Group Bangalore AI builder sprint",
      url: "https://gdg.community.dev/gdg-bangalore/",
      source: "devfolio",
      startDate: "2026-02-22T09:00:00.000Z",
      endDate: "2026-02-22T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["AI", "Google Cloud", "Machine Learning", "TensorFlow"],
      prizes: "Swags & Mentorship",
      participants: 150,
      status: "upcoming",
    },
    {
      id: "curated-engineerx-hackfest-blr",
      name: "EngineerX HackFest",
      tagline: "General engineering and coding hackathon sprint",
      url: "https://unstop.com",
      source: "devpost",
      startDate: "2026-02-23T09:00:00.000Z",
      endDate: "2026-02-24T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Full Stack", "Systems", "Open Innovation"],
      prizes: "₹50,000+",
      participants: 250,
      status: "upcoming",
    },
    {
      id: "curated-agentic-india-3-blr",
      name: "Agentic India 3.0",
      tagline: "AI Agents & Automation – build the next wave of intelligent agents",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-26T09:00:00.000Z",
      endDate: "2026-02-27T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["AI Agents", "Automation", "LLMs"],
      prizes: "₹2,00,000+",
      participants: 400,
      status: "upcoming",
    },
    {
      id: "curated-inceptrix-2-jain-blr",
      name: "Inceptrix 2.0 (JAIN University)",
      tagline: "Shape Reality – AI, Systems & Disruptive Innovation. Partners: IBM, Dell, TCS, IEEE",
      url: "https://unstop.com",
      source: "devpost",
      startDate: "2026-02-27T09:00:00.000Z",
      endDate: "2026-02-28T18:00:00.000Z",
      location: "JAIN University (JU-FET), Bengaluru",
      mode: "in-person",
      themes: ["AI", "Automation", "Disruptive Innovation", "Systems"],
      prizes: "₹1,50,000+",
      participants: 500,
      status: "upcoming",
    },
    {
      id: "curated-ghrhack-2-blr",
      name: "GHRhack 2.0",
      tagline: "General tech open-theme hackathon",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-02-28T09:00:00.000Z",
      endDate: "2026-03-01T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Open Innovation"],
      prizes: "₹30,000+",
      participants: 200,
      status: "upcoming",
    },
    // March 2026
    {
      id: "curated-binary-v2-blr",
      name: "BINARY v2",
      tagline: "Competitive programming meets building – code, compete, create",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-03-07T09:00:00.000Z",
      endDate: "2026-03-08T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Competitive Programming", "Full Stack", "Open Innovation"],
      prizes: "₹75,000+",
      participants: 300,
      status: "upcoming",
    },
    {
      id: "curated-rvce-hackfest-2026",
      name: "RVCE HackFest 2026",
      tagline: "Annual hackathon by R.V. College of Engineering, Bengaluru",
      url: "https://unstop.com",
      source: "devfolio",
      startDate: "2026-03-07T09:00:00.000Z",
      endDate: "2026-03-08T18:00:00.000Z",
      location: "R.V. College of Engineering, Bengaluru",
      mode: "in-person",
      themes: ["Full Stack", "IoT", "AI/ML", "Blockchain", "Open Innovation"],
      prizes: "₹1,00,000+",
      participants: 400,
      status: "upcoming",
    },
    {
      id: "curated-electrothon-8-blr",
      name: "Electrothon 8.0",
      tagline: "Hardware-inclusive hackathon – IoT, Embedded Systems, Electronics",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-03-13T09:00:00.000Z",
      endDate: "2026-03-14T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Hardware", "IoT", "Embedded Systems", "Electronics"],
      prizes: "₹1,00,000+",
      participants: 350,
      status: "upcoming",
    },
    {
      id: "curated-hack-nocturne-26",
      name: "Hack-Nocturne 2.0",
      tagline: "24-hour night hackathon at Sir MVIT Bengaluru – AI, Blockchain, Web3 & more",
      url: "https://hack-nocturne.in",
      source: "devfolio",
      startDate: "2026-03-13T18:00:00.000Z",
      endDate: "2026-03-14T18:00:00.000Z",
      location: "Sir M. Visvesvaraya Institute of Technology, Bengaluru",
      mode: "in-person",
      themes: ["AI & ML", "Network Security", "Blockchain", "Web3", "App Dev", "Web Dev", "Open Innovation"],
      prizes: "₹50,000+",
      participants: 300,
      status: "upcoming",
    },
    {
      id: "curated-pes-hackathon-2026",
      name: "PES University HackPES 2026",
      tagline: "Flagship hackathon by PES University, Bengaluru",
      url: "https://unstop.com",
      source: "devfolio",
      startDate: "2026-03-14T09:00:00.000Z",
      endDate: "2026-03-15T18:00:00.000Z",
      location: "PES University, Bengaluru",
      mode: "in-person",
      themes: ["HealthTech", "EdTech", "FinTech", "Sustainability", "Open Innovation"],
      prizes: "₹75,000+",
      participants: 350,
      status: "upcoming",
    },
    {
      id: "curated-reckon-7-blr",
      name: "RECKON 7.0",
      tagline: "Online open-theme hackathon from Bengaluru college circuit",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-03-14T09:00:00.000Z",
      endDate: "2026-03-15T18:00:00.000Z",
      location: "Online (Bengaluru-based)",
      mode: "online",
      themes: ["Open Innovation"],
      prizes: "₹40,000+",
      participants: 500,
      status: "upcoming",
    },
    {
      id: "curated-et-genai-2026",
      name: "ET GenAI Hackathon 2026",
      tagline: "Economic Times GenAI Hackathon – Media, FinTech, Smart Cities, Healthcare",
      url: "https://economictimes.com",
      source: "devpost",
      startDate: "2026-03-20T09:00:00.000Z",
      endDate: "2026-03-28T18:00:00.000Z",
      location: "Bengaluru, India (Hybrid)",
      mode: "hybrid",
      themes: ["GenAI", "Media Innovation", "FinTech", "Smart Cities", "Healthcare", "Open Innovation"],
      prizes: "₹10 Lakh",
      participants: 1000,
      status: "upcoming",
    },
    {
      id: "curated-bmsce-codefest-2026",
      name: "BMSCE CodeFest 2026",
      tagline: "Annual coding and hackathon fest by BMS College of Engineering",
      url: "https://unstop.com",
      source: "devfolio",
      startDate: "2026-03-21T09:00:00.000Z",
      endDate: "2026-03-22T18:00:00.000Z",
      location: "BMS College of Engineering, Bengaluru",
      mode: "in-person",
      themes: ["Web Dev", "Mobile Dev", "AI/ML", "Cloud Computing"],
      prizes: "₹50,000+",
      participants: 250,
      status: "upcoming",
    },
    {
      id: "curated-hackprix-s3-blr",
      name: "HackPrix Season 3",
      tagline: "Product Design & Engineering focused hackathon",
      url: "https://devfolio.co/hackathons",
      source: "devfolio",
      startDate: "2026-03-28T09:00:00.000Z",
      endDate: "2026-03-29T18:00:00.000Z",
      location: "Bengaluru, India",
      mode: "in-person",
      themes: ["Product Design", "UI/UX", "Engineering"],
      prizes: "₹80,000+",
      participants: 300,
      status: "upcoming",
    },
  ];

  // Auto-compute status based on current date
  return hackathons.map((h) => {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    let status: Hackathon["status"] = "upcoming";
    if (now > end) status = "ended";
    else if (now >= start) status = "open";
    return { ...h, status };
  });
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

  const [devfolio, mlh, devpost, unstop] = await Promise.all([
    fetchDevfolio(),
    fetchMLH(),
    fetchDevpost(),
    fetchUnstop(),
  ]);

  const curated = getCuratedBangaloreHackathons();

  // Merge curated with scraped, deduplicate by id
  const allMap = new Map<string, Hackathon>();
  for (const h of [...devfolio, ...mlh, ...devpost, ...unstop, ...curated]) {
    if (!allMap.has(h.id)) allMap.set(h.id, h);
  }
  const all = Array.from(allMap.values());

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
