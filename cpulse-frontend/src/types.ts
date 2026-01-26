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
