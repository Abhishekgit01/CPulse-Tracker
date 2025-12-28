export interface User {
  handle: string;
  platform: "codeforces" | "leetcode";
  rating?: number;
  totalSolved?: number;
  rank?: string;
  classId?: string;
}
