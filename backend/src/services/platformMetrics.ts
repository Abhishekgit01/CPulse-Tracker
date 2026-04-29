import { IUser, User } from "../models/User";
import { calculateCPulseRating } from "./cpulseRating";
import { getUserInfo } from "./codeforces";
import { getLeetCodeUser } from "./leetcode";
import { getCodeChefUser } from "./codechef";

type SupportedPlatform = IUser["platform"];

const platformFetchers: Record<
  SupportedPlatform,
  (username: string) => Promise<Record<string, any>>
> = {
  codeforces: getUserInfo,
  leetcode: getLeetCodeUser,
  codechef: getCodeChefUser,
};

function isSupportedPlatform(platform: string): platform is SupportedPlatform {
  return platform in platformFetchers;
}

function serializeMetrics(user: IUser) {
  return {
    platform: user.platform,
    handle: user.handle,
    rating: user.rating,
    maxRating: user.maxRating,
    rank: user.rank,
    maxRank: user.maxRank,
    totalSolved: user.totalSolved || user.problemsSolved || 0,
    cpulseRating: user.cpulseRating,
    history: user.history || [],
    avatar: user.avatar,
    title: user.title,
    contribution: user.contribution,
    friendOfCount: user.friendOfCount,
    organization: user.organization,
    lastOnlineTimeSeconds: user.lastOnlineTimeSeconds,
    contestRating: user.contestRating,
    globalRanking: user.globalRanking,
    topPercentage: user.topPercentage,
    reputation: user.reputation,
    division: user.division,
    country: user.country,
    badges: user.badges || [],
    languages: user.languages || [],
    topTags: user.topTags || [],
    recentSubmissions: user.recentSubmissions || [],
    registrationTimeSeconds: user.registrationTimeSeconds,
    city: user.city,
    easySolved: user.easySolved,
    mediumSolved: user.mediumSolved,
    hardSolved: user.hardSolved,
    totalSubmissions: user.totalSubmissions,
    aboutMe: user.aboutMe || "",
    skillTags: user.skillTags || [],
    realName: user.realName || "",
    company: user.company || "",
    school: user.school || "",
    websites: user.websites || [],
    stars: user.stars,
    globalRank: user.globalRank,
    countryRank: user.countryRank,
    problemsSolved: user.problemsSolved,
    contestHistory: user.contestHistory || [],
    contestsAttended: user.contestsAttended || 0,
    institution: user.institution || "",
    heatMap: user.heatMap || [],
    totalActiveDays: user.totalActiveDays || 0,
    streak: user.streak || 0,
  };
}

export async function getMetricsForUser(platform: string, username: string) {
  if (!isSupportedPlatform(platform)) {
    throw new Error("Unsupported platform");
  }

  const existing = await User.findOne({
    handle: username,
    platform,
  });

  if (existing) {
    return serializeMetrics(existing);
  }

  const normalizedData = await platformFetchers[platform](username);
  const userPayload = { ...normalizedData, platform };

  let user = await User.findOne({ handle: normalizedData.handle, platform });

  if (user) {
    user.set(userPayload);
  } else {
    user = new User(userPayload);
  }

  await user.save();
  user.cpulseRating = calculateCPulseRating(user as any);
  await user.save();

  return serializeMetrics(user);
}
