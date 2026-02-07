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
