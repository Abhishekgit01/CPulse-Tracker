export interface User {
  handle: string;
  platform: "codeforces" | "leetcode" | "codechef";
  rating?: number;
  totalSolved?: number;
  rank?: string;
  classId?: string;

  // CodeChef specific
  stars?: number;
  problemsSolved?: number;
}

export interface College {
  _id: string;
  name: string;
  code: string;
  description?: string;
  managers?: { _id: string; displayName?: string; email: string }[];
  courseCount?: number;
  memberCount?: number;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  collegeId: string;
  description?: string;
  memberCount?: number;
  createdAt?: string;
}

export interface JoinRequest {
  _id: string;
  userId: string | { _id: string; displayName?: string; email: string; cpProfiles?: any[] };
  collegeId: string | { _id: string; name: string; code: string };
  courseId?: string | { _id: string; name: string; code: string };
  status: "pending" | "approved" | "rejected";
  message?: string;
  requestedAt: string;
  processedAt?: string;
}

/* =================== Community Types =================== */

export interface PostAuthor {
  _id: string;
  displayName?: string;
  email: string;
}

export interface CommunityPost {
  _id: string;
  authorId: string;
  author: PostAuthor | null;
  type: "discussion" | "recruitment";
  title: string;
  content: string;
  hackathonId?: string;
  hackathonName?: string;
  teamSize?: number;
  rolesNeeded?: string[];
  upvotes: string[];
  downvotes: string[];
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  _id: string;
  postId: string;
  authorId: string;
  author: PostAuthor | null;
  parentId: string | null;
  content: string;
  upvotes: string[];
  downvotes: string[];
  score: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface UserProfileData {
  _id: string;
  userId: string;
  bio: string;
  location: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  totalPosts: number;
  totalComments: number;
  reputation: number;
  points: number;
  theme: string;
  borderStyle: string;
  badgeShowcase: string[];
  avatarFrame: string;
  bannerColor: string;
  unlockedThemes: string[];
  unlockedBorders: string[];
  unlockedFrames: string[];
}

export interface RewardData {
  _id: string;
  userId: string;
  type: "badge" | "theme" | "border" | "frame" | "points";
  name: string;
  description: string;
  icon?: string;
  points?: number;
  earnedAt: string;
  source: string;
}
