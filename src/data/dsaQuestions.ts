export interface DSAQuestion {
  id: string;
  title: string;
  platform: "LeetCode" | "Codeforces" | "CodeChef";
  platformUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hint1: string;
  hint2: string;
  solutionParts: [string, string, string];
  fullExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
}

const questions: DSAQuestion[] = [
  // ─── EASY ───────────────────────────────────────────
  {
    id: "lc-1",
    title: "Two Sum",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    hint1: "Think about using a hash map to store values you've already seen.",
    hint2: "For each element, check if (target - element) already exists in the hash map. If yes, you found the pair.",
    solutionParts: [
      `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;`,
      `        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }`,
      `            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    ],
    fullExplanation:
      "We iterate through the array once. For each element, we compute its complement (target - nums[i]). We check if this complement is already in our hash map. If it is, we've found the two numbers that add to the target. If not, we store the current number and its index in the hash map. This gives us O(n) time since hash map lookups are O(1) on average.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  {
    id: "lc-121",
    title: "Best Time to Buy and Sell Stock",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    difficulty: "Easy",
    tags: ["Arrays", "Dynamic Programming"],
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No profitable transaction is possible." },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    hint1: "Track the minimum price seen so far as you scan left to right.",
    hint2: "At each step, the maximum profit is the current price minus the minimum price seen so far. Keep a running max of this value.",
    solutionParts: [
      `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX;
        int maxProfit = 0;`,
      `        for (int price : prices) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);`,
      `        }
        return maxProfit;
    }
};`,
    ],
    fullExplanation:
      "We scan the prices from left to right, maintaining the minimum price seen so far. At each day, the best profit we could get by selling today is (today's price - minimum price so far). We track the maximum of this across all days. This works because we can only sell after buying, and we always consider buying at the cheapest historical price.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-20",
    title: "Valid Parentheses",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "Easy",
    tags: ["Stack", "Strings"],
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    hint1: "Use a stack data structure. Push opening brackets onto the stack.",
    hint2: "When you encounter a closing bracket, check if the top of the stack is the matching opening bracket. If so, pop; otherwise it's invalid.",
    solutionParts: [
      `#include <stack>
#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;`,
      `        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;`,
      `            }
        }
        return st.empty();
    }
};`,
    ],
    fullExplanation:
      "We use a stack to track unmatched opening brackets. For each character: if it's an opening bracket, push it. If it's a closing bracket, check if the stack is non-empty and the top matches. At the end, the stack must be empty for the string to be valid. This correctly handles nested and sequential brackets.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  {
    id: "lc-206",
    title: "Reverse Linked List",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/reverse-linked-list/",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the list is in the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    hint1: "Use three pointers: prev, curr, and next.",
    hint2: "At each step, save curr->next, then point curr->next to prev, then advance prev and curr forward.",
    solutionParts: [
      `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;`,
      `        while (curr != nullptr) {
            ListNode* nextTemp = curr->next;
            curr->next = prev;`,
      `            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
};`,
    ],
    fullExplanation:
      "We iterate through the list maintaining three pointers. At each step: (1) save curr->next before we overwrite it, (2) reverse the link by pointing curr->next to prev, (3) advance prev to curr and curr to the saved next. When curr becomes null, prev points to the new head of the reversed list.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-53",
    title: "Maximum Subarray",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/maximum-subarray/",
    difficulty: "Medium",
    tags: ["Arrays", "Dynamic Programming", "Greedy"],
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    hint1: "Think about Kadane's algorithm. At each position, decide whether to extend the previous subarray or start a new one.",
    hint2: "Maintain a running sum. If it drops below 0, reset it to 0 (start fresh). Track the maximum sum seen at any point.",
    solutionParts: [
      `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];`,
      `        for (int i = 1; i < nums.size(); i++) {
            currentSum = max(nums[i], currentSum + nums[i]);`,
      `            maxSum = max(maxSum, currentSum);
        }
        return maxSum;
    }
};`,
    ],
    fullExplanation:
      "Kadane's algorithm works by scanning through the array and at each position deciding whether to extend the existing subarray or start a new one. If currentSum + nums[i] is less than nums[i] alone, we start fresh from nums[i]. We always update maxSum with the best value seen so far. This greedy approach works because any subarray with a negative prefix sum can be improved by dropping that prefix.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },

  // ─── MEDIUM ─────────────────────────────────────────
  {
    id: "lc-3",
    title: "Longest Substring Without Repeating Characters",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "Medium",
    tags: ["Strings", "Sliding Window", "Hash Table"],
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    hint1: "Use a sliding window approach with two pointers.",
    hint2: "Maintain a set/map of characters in the current window. When you find a duplicate, shrink the window from the left until the duplicate is removed.",
    solutionParts: [
      `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> charIndex;
        int maxLen = 0, left = 0;`,
      `        for (int right = 0; right < s.size(); right++) {
            if (charIndex.count(s[right]) && charIndex[s[right]] >= left) {
                left = charIndex[s[right]] + 1;
            }`,
      `            charIndex[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
    ],
    fullExplanation:
      "We use a sliding window [left, right]. We expand right one character at a time. If s[right] was seen before and its last index is within our current window (>= left), we move left past that previous occurrence. We store each character's latest index in a hash map. At each step, we update the maximum window length. This ensures we always have a window with unique characters.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(n, m)) where m is charset size",
  },
  {
    id: "lc-15",
    title: "3Sum",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/3sum/",
    difficulty: "Medium",
    tags: ["Arrays", "Two Pointers", "Sorting"],
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    hint1: "Sort the array first, then fix one element and use two pointers for the remaining two.",
    hint2: "After sorting, for each nums[i], use left = i+1 and right = end. Skip duplicates for both the outer loop and inner pointers to avoid duplicate triplets.",
    solutionParts: [
      `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> result;
        sort(nums.begin(), nums.end());
        int n = nums.size();`,
      `        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i-1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else {
                    result.push_back({nums[i], nums[left], nums[right]});`,
      `                    while (left < right && nums[left] == nums[left+1]) left++;
                    while (left < right && nums[right] == nums[right-1]) right--;
                    left++; right--;
                }
            }
        }
        return result;
    }
};`,
    ],
    fullExplanation:
      "First sort the array. Then for each element nums[i], we reduce the problem to 2Sum using two pointers (left, right). If the sum is too small, move left right; if too large, move right left. When we find a triplet, we add it and skip duplicates. The outer loop also skips duplicate values of nums[i]. Sorting enables both the two-pointer approach and easy duplicate skipping.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1) ignoring output",
  },
  {
    id: "lc-200",
    title: "Number of Islands",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "Medium",
    tags: ["Graphs", "BFS", "DFS"],
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    examples: [
      {
        input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]',
        output: "1",
      },
      {
        input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]',
        output: "3",
      },
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
    hint1: "Iterate through each cell. When you find a '1', that's a new island — increment count.",
    hint2: "Use DFS/BFS from that '1' to mark all connected '1's as visited (e.g., change them to '0'). This way each island is counted exactly once.",
    solutionParts: [
      `#include <vector>
using namespace std;

class Solution {
public:
    void dfs(vector<vector<char>>& grid, int i, int j) {
        if (i < 0 || i >= grid.size() || j < 0 || j >= grid[0].size())
            return;
        if (grid[i][j] == '0') return;
        grid[i][j] = '0';`,
      `        dfs(grid, i+1, j);
        dfs(grid, i-1, j);
        dfs(grid, i, j+1);
        dfs(grid, i, j-1);
    }`,
      `    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int i = 0; i < grid.size(); i++)
            for (int j = 0; j < grid[0].size(); j++)
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
        return count;
    }
};`,
    ],
    fullExplanation:
      "We scan every cell. When we find an unvisited '1', we've discovered a new island, so we increment our count. We then run DFS from that cell, marking all connected '1's as '0' (visited). This flood-fill ensures we don't double-count cells belonging to the same island. After scanning all cells, count holds the total number of islands.",
    timeComplexity: "O(m * n)",
    spaceComplexity: "O(m * n) worst case recursion stack",
  },
  {
    id: "lc-322",
    title: "Coin Change",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/coin-change/",
    difficulty: "Medium",
    tags: ["Dynamic Programming", "Arrays"],
    description:
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.",
    examples: [
      { input: "coins = [1,5,11], amount = 11", output: "1", explanation: "11 = 11" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    hint1: "Think about dynamic programming. Define dp[i] as the minimum coins needed to make amount i.",
    hint2: "For each amount i from 1 to amount, try every coin. If coin <= i, then dp[i] = min(dp[i], dp[i - coin] + 1). Initialize dp[0] = 0 and all others to amount+1 (infinity).",
    solutionParts: [
      `#include <vector>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;`,
      `        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = min(dp[i], dp[i - coin] + 1);
                }`,
      `            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
    ],
    fullExplanation:
      "We build a DP table where dp[i] represents the minimum number of coins to make amount i. Base case: dp[0] = 0 (zero coins for zero amount). For each amount from 1 to target, we try every coin denomination. If the coin fits (coin <= i), we check if using it gives fewer coins: dp[i - coin] + 1. If dp[amount] was never updated from our initial large value, it's impossible, so we return -1.",
    timeComplexity: "O(amount * coins.length)",
    spaceComplexity: "O(amount)",
  },
  {
    id: "lc-102",
    title: "Binary Tree Level Order Traversal",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    difficulty: "Medium",
    tags: ["Trees", "BFS", "Queue"],
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes is in range [0, 2000].", "-1000 <= Node.val <= 1000"],
    hint1: "Use a queue (BFS). Process all nodes at the current level before moving to the next.",
    hint2: "At each level, record the queue size (that's how many nodes are on this level). Dequeue that many nodes, adding their children for the next level.",
    solutionParts: [
      `#include <vector>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        queue<TreeNode*> q;
        q.push(root);`,
      `        while (!q.empty()) {
            int levelSize = q.size();
            vector<int> level;
            for (int i = 0; i < levelSize; i++) {
                TreeNode* node = q.front(); q.pop();
                level.push_back(node->val);`,
      `                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            result.push_back(level);
        }
        return result;
    }
};`,
    ],
    fullExplanation:
      "We use BFS with a queue. We start by pushing the root. In each iteration, we read the current queue size — this tells us exactly how many nodes are at the current level. We process that many nodes: dequeue each, record its value, and enqueue its children. After processing all nodes of a level, we push the collected values as one vector into our result. This naturally groups nodes by level.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  {
    id: "cf-1",
    title: "Watermelon",
    platform: "Codeforces",
    platformUrl: "https://codeforces.com/problemset/problem/4/A",
    difficulty: "Easy",
    tags: ["Math"],
    description:
      "Pete and Billy have a watermelon weighing w kilos. They want to divide it into two parts, each weighing an even number of kilos. Can they do it?\n\nPete and Billy are not very smart, so they want you to help them.",
    examples: [
      { input: "8", output: "YES", explanation: "8 can be split into 2 + 6, both even." },
    ],
    constraints: ["1 <= w <= 100"],
    hint1: "Think about when a number can be split into two even parts.",
    hint2: "A number can be split into two positive even parts if and only if it is even and greater than 2.",
    solutionParts: [
      `#include <iostream>
using namespace std;

int main() {
    int w;
    cin >> w;`,
      `    if (w > 2 && w % 2 == 0) {
        cout << "YES" << endl;`,
      `    } else {
        cout << "NO" << endl;
    }
    return 0;
}`,
    ],
    fullExplanation:
      "If w is even and greater than 2, we can always split it into 2 and (w-2), both of which are positive even numbers. If w is odd, no split into two even parts is possible. If w is 2, the only split is 0+2, but 0 is not a valid positive part.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-141",
    title: "Linked List Cycle",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/linked-list-cycle/",
    difficulty: "Easy",
    tags: ["Linked List", "Two Pointers"],
    description:
      "Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.\n\nReturn true if there is a cycle in the linked list. Otherwise, return false.",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "There is a cycle where tail connects to node index 1." },
      { input: "head = [1,2], pos = 0", output: "true" },
      { input: "head = [1], pos = -1", output: "false" },
    ],
    constraints: ["The number of nodes is in range [0, 10^4].", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index."],
    hint1: "Use Floyd's cycle detection algorithm (tortoise and hare).",
    hint2: "Use two pointers: slow moves 1 step, fast moves 2 steps. If they meet, there's a cycle. If fast reaches null, there's no cycle.",
    solutionParts: [
      `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;`,
      `        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;`,
      `            if (slow == fast) return true;
        }
        return false;
    }
};`,
    ],
    fullExplanation:
      "Floyd's tortoise and hare algorithm uses two pointers moving at different speeds. The slow pointer moves one step at a time, while the fast pointer moves two steps. If there's a cycle, the fast pointer will eventually lap the slow pointer and they'll meet. If there's no cycle, the fast pointer will reach the end (null). This works because in a cycle, the fast pointer closes the gap by 1 node per iteration.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },

  // ─── HARD ───────────────────────────────────────────
  {
    id: "lc-42",
    title: "Trapping Rain Water",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/trapping-rain-water/",
    difficulty: "Hard",
    tags: ["Arrays", "Two Pointers", "Stack"],
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map can trap 6 units of rain water." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    hint1: "Water at each position depends on the minimum of the max height to its left and max height to its right.",
    hint2: "Use two pointers from both ends. Track leftMax and rightMax. The pointer with the smaller max determines the water level at that position.",
    solutionParts: [
      `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;`,
      `        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax)
                    leftMax = height[left];
                else
                    water += leftMax - height[left];
                left++;`,
      `            } else {
                if (height[right] >= rightMax)
                    rightMax = height[right];
                else
                    water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};`,
    ],
    fullExplanation:
      "We use two pointers starting from both ends. We maintain leftMax (max height seen from the left) and rightMax (max height seen from the right). At each step, we process the side with the smaller height. If height[left] < height[right], the water at position left is determined by leftMax (since rightMax >= height[right] > height[left], so the bottleneck is on the left side). We add (leftMax - height[left]) water if leftMax > height[left], otherwise update leftMax. Similarly for the right side.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-23",
    title: "Merge k Sorted Lists",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    difficulty: "Hard",
    tags: ["Linked List", "Heap / Priority Queue"],
    description:
      "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[]]", output: "[]" },
    ],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4", "lists[i] is sorted in ascending order.", "The sum of lists[i].length will not exceed 10^4."],
    hint1: "Use a min-heap (priority queue) to always get the smallest element among k list heads.",
    hint2: "Push the head of each non-empty list into the heap. Pop the min, add it to the result, and push that node's next (if exists) back into the heap.",
    solutionParts: [
      `#include <vector>
#include <queue>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);`,
      `        for (auto* l : lists)
            if (l) pq.push(l);

        ListNode dummy(0);
        ListNode* tail = &dummy;

        while (!pq.empty()) {
            ListNode* node = pq.top(); pq.pop();
            tail->next = node;
            tail = tail->next;`,
      `            if (node->next) pq.push(node->next);
        }
        return dummy.next;
    }
};`,
    ],
    fullExplanation:
      "We use a min-heap to efficiently find the smallest element among all k list heads. Initially, we push the head of each non-empty list. Then we repeatedly: (1) pop the minimum node, (2) append it to our result list, (3) if that node has a next, push it into the heap. The heap always has at most k elements, so each push/pop is O(log k). We process all n total nodes, giving O(n log k) time.",
    timeComplexity: "O(n log k)",
    spaceComplexity: "O(k)",
  },
  {
    id: "lc-76",
    title: "Minimum Window Substring",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/minimum-window-substring/",
    difficulty: "Hard",
    tags: ["Strings", "Sliding Window", "Hash Table"],
    description:
      "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".\n\nThe testcases will be generated such that the answer is unique.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: "The minimum window substring containing A, B, and C is BANC." },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""', explanation: "Both 'a's from t must be in the window, but s only has one 'a'." },
    ],
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5", "s and t consist of uppercase and lowercase English letters."],
    hint1: "Use a sliding window with two pointers and character frequency counts.",
    hint2: "Expand right to include chars until the window satisfies the requirement (has all chars of t). Then shrink from left to find the minimum such window. Use a 'formed' counter to track how many unique chars meet the required frequency.",
    solutionParts: [
      `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        unordered_map<char, int> need, have;
        for (char c : t) need[c]++;
        int required = need.size(), formed = 0;
        int left = 0, minLen = INT_MAX, minStart = 0;`,
      `        for (int right = 0; right < s.size(); right++) {
            char c = s[right];
            have[c]++;
            if (need.count(c) && have[c] == need[c]) formed++;

            while (formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minStart = left;
                }`,
      `                have[s[left]]--;
                if (need.count(s[left]) && have[s[left]] < need[s[left]])
                    formed--;
                left++;
            }
        }
        return minLen == INT_MAX ? "" : s.substr(minStart, minLen);
    }
};`,
    ],
    fullExplanation:
      "We maintain a sliding window [left, right]. 'need' stores character frequencies required by t. 'have' tracks frequencies in our current window. 'formed' counts how many unique characters have met their required frequency. We expand right to grow the window. Once formed == required (window has all needed chars), we try shrinking from left to minimize the window size, recording the smallest valid window found. This two-pointer approach ensures each character is visited at most twice (once by right, once by left).",
    timeComplexity: "O(m + n)",
    spaceComplexity: "O(m + n)",
  },
  {
    id: "lc-297",
    title: "Serialize and Deserialize Binary Tree",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    difficulty: "Hard",
    tags: ["Trees", "DFS", "Strings"],
    description:
      "Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a data structure into a sequence of bits so that it can be stored or transmitted and reconstructed later.\n\nThere is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes is in range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    hint1: "Use preorder traversal for serialization, marking null nodes with a special token.",
    hint2: "For deserialization, use the same preorder sequence with a queue/index. Read values sequentially: if it's a null marker, return nullptr; otherwise create a node and recursively build its left and right subtrees.",
    solutionParts: [
      `#include <string>
#include <sstream>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Codec {
public:
    string serialize(TreeNode* root) {
        if (!root) return "null";
        return to_string(root->val) + ","
             + serialize(root->left) + ","
             + serialize(root->right);
    }`,
      `    TreeNode* deserialize(string data) {
        queue<string> tokens;
        stringstream ss(data);
        string token;
        while (getline(ss, token, ',')) tokens.push(token);
        return buildTree(tokens);
    }`,
      `private:
    TreeNode* buildTree(queue<string>& tokens) {
        string val = tokens.front(); tokens.pop();
        if (val == "null") return nullptr;
        TreeNode* node = new TreeNode(stoi(val));
        node->left = buildTree(tokens);
        node->right = buildTree(tokens);
        return node;
    }
};`,
    ],
    fullExplanation:
      "Serialization uses preorder DFS: visit root, then left, then right. Null nodes are recorded as 'null'. Deserialization splits the string into tokens and processes them in the same preorder sequence. For each token: if 'null', return nullptr; otherwise create a node and recursively build its left and right children. Since we recorded nulls, the preorder sequence uniquely determines the tree structure.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
  {
    id: "cc-1",
    title: "ATM",
    platform: "CodeChef",
    platformUrl: "https://www.codechef.com/problems/HS08TEST",
    difficulty: "Easy",
    tags: ["Math"],
    description:
      "Pooja would like to withdraw X dollars from an ATM. The cash machine will only accept the transaction if X is a multiple of 5, and Pooja's account balance has enough cash to perform the withdrawal transaction (including bank charges). For each successful withdrawal the bank charges 0.50 dollars.\n\nCalculate Pooja's account balance after an attempted transaction.",
    examples: [
      { input: "30 120.00", output: "89.50", explanation: "30 is a multiple of 5 and 30 + 0.50 <= 120.00, so balance = 120.00 - 30 - 0.50 = 89.50" },
      { input: "42 120.00", output: "120.00", explanation: "42 is not a multiple of 5, so the transaction fails." },
    ],
    constraints: ["0 < X <= 2000", "0 < balance <= 2000"],
    hint1: "The withdrawal succeeds only if X is a multiple of 5 AND the balance covers X + 0.50.",
    hint2: "If the withdrawal succeeds, subtract X + 0.50 from the balance. Otherwise, output the original balance.",
    solutionParts: [
      `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int X;
    double balance;
    cin >> X >> balance;`,
      `    if (X % 5 == 0 && X + 0.50 <= balance) {
        balance -= X + 0.50;`,
      `    }
    cout << fixed << setprecision(2) << balance << endl;
    return 0;
}`,
    ],
    fullExplanation:
      "We check two conditions: (1) X must be a multiple of 5 (X % 5 == 0), and (2) the balance must be enough to cover the withdrawal plus the bank charge (X + 0.50 <= balance). If both conditions are met, we deduct X + 0.50 from the balance. Otherwise, the balance remains unchanged. Output the balance with 2 decimal places.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-33",
    title: "Search in Rotated Sorted Array",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    difficulty: "Medium",
    tags: ["Binary Search", "Arrays"],
    description:
      "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" },
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique.", "nums is an ascending array that is possibly rotated."],
    hint1: "Use modified binary search. One half of the array is always sorted.",
    hint2: "Find which half is sorted by comparing nums[mid] with nums[left]. If the target falls in the sorted half, search there; otherwise search the other half.",
    solutionParts: [
      `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;`,
      `        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;

            if (nums[left] <= nums[mid]) {
                // left half is sorted
                if (target >= nums[left] && target < nums[mid])
                    right = mid - 1;
                else
                    left = mid + 1;`,
      `            } else {
                // right half is sorted
                if (target > nums[mid] && target <= nums[right])
                    left = mid + 1;
                else
                    right = mid - 1;
            }
        }
        return -1;
    }
};`,
    ],
    fullExplanation:
      "In a rotated sorted array, at least one half (left or right of mid) is always sorted. We determine which half is sorted by comparing nums[left] with nums[mid]. If nums[left] <= nums[mid], the left half is sorted. We then check if the target falls within this sorted range. If yes, we search that half; otherwise, we search the other half. This maintains O(log n) by halving the search space each time.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
  },
  {
    id: "lc-46",
    title: "Permutations",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/permutations/",
    difficulty: "Medium",
    tags: ["Backtracking", "Recursion", "Arrays"],
    description:
      "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    examples: [
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
      { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
      { input: "nums = [1]", output: "[[1]]" },
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All the integers of nums are unique."],
    hint1: "Use backtracking. Build permutations one element at a time.",
    hint2: "Maintain a 'used' boolean array. At each recursion level, try each unused element, mark it as used, recurse, then unmark it (backtrack).",
    solutionParts: [
      `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> result;

    void backtrack(vector<int>& nums, vector<int>& current, vector<bool>& used) {
        if (current.size() == nums.size()) {
            result.push_back(current);
            return;
        }`,
      `        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            current.push_back(nums[i]);
            backtrack(nums, current, used);`,
      `            current.pop_back();
            used[i] = false;
        }
    }

    vector<vector<int>> permute(vector<int>& nums) {
        vector<int> current;
        vector<bool> used(nums.size(), false);
        backtrack(nums, current, used);
        return result;
    }
};`,
    ],
    fullExplanation:
      "We use backtracking to build all permutations. At each step, we try adding each unused element to the current permutation. When the permutation reaches the same length as nums, we've found a complete permutation and add it to results. After the recursive call returns, we undo our choice (remove the last element, mark it unused) and try the next option. This explores all n! possible orderings.",
    timeComplexity: "O(n * n!)",
    spaceComplexity: "O(n)",
  },
  {
    id: "lc-230",
    title: "Kth Smallest Element in a BST",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    difficulty: "Medium",
    tags: ["Binary Search Tree", "Trees", "DFS"],
    description:
      "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    examples: [
      { input: "root = [3,1,4,null,2], k = 1", output: "1" },
      { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3" },
    ],
    constraints: ["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
    hint1: "In-order traversal of a BST visits nodes in ascending order.",
    hint2: "Do an in-order traversal, counting nodes visited. When you reach the kth node, that's your answer. You can stop early.",
    solutionParts: [
      `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int count = 0;
    int result = 0;`,
      `    void inorder(TreeNode* node, int k) {
        if (!node || count >= k) return;
        inorder(node->left, k);
        count++;
        if (count == k) {
            result = node->val;
            return;
        }`,
      `        inorder(node->right, k);
    }

    int kthSmallest(TreeNode* root, int k) {
        inorder(root, k);
        return result;
    }
};`,
    ],
    fullExplanation:
      "A BST's in-order traversal (left, root, right) visits nodes in ascending sorted order. We perform in-order traversal while maintaining a counter. When the counter reaches k, we've found the kth smallest element. We can short-circuit and stop recursing once found (count >= k check). This is more efficient than collecting all values and sorting.",
    timeComplexity: "O(H + k) where H is tree height",
    spaceComplexity: "O(H) for recursion stack",
  },
  {
    id: "lc-208",
    title: "Implement Trie (Prefix Tree)",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    difficulty: "Medium",
    tags: ["Trie", "Strings"],
    description:
      "A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n\nImplement the Trie class:\n- Trie() Initializes the trie object.\n- void insert(String word) Inserts the string word into the trie.\n- boolean search(String word) Returns true if the string word is in the trie.\n- boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix.",
    examples: [
      {
        input: '[\"Trie\", \"insert\", \"search\", \"search\", \"startsWith\", \"insert\", \"search\"]\n[[], [\"apple\"], [\"apple\"], [\"app\"], [\"app\"], [\"app\"], [\"app\"]]',
        output: "[null, null, true, false, true, null, true]",
      },
    ],
    constraints: ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters.", "At most 3 * 10^4 calls in total."],
    hint1: "Each node has up to 26 children (one for each letter). Also store an 'isEnd' flag.",
    hint2: "Insert: traverse/create nodes for each character, mark the last as isEnd. Search: traverse nodes for each character, return true only if last node has isEnd. startsWith: same as search but don't check isEnd.",
    solutionParts: [
      `#include <string>
using namespace std;

class Trie {
    struct TrieNode {
        TrieNode* children[26] = {};
        bool isEnd = false;
    };
    TrieNode* root;

public:
    Trie() { root = new TrieNode(); }`,
      `    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i])
                node->children[i] = new TrieNode();
            node = node->children[i];
        }
        node->isEnd = true;
    }`,
      `    bool search(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i]) return false;
            node = node->children[i];
        }
        return node->isEnd;
    }

    bool startsWith(string prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            int i = c - 'a';
            if (!node->children[i]) return false;
            node = node->children[i];
        }
        return true;
    }
};`,
    ],
    fullExplanation:
      "A Trie stores strings character by character in a tree. Each node has 26 possible children (one per letter) and a boolean isEnd. Insert: for each character, traverse to the child (creating it if it doesn't exist), then mark the final node as a word ending. Search: traverse for each character; if a child is missing, the word doesn't exist; if we reach the end, check isEnd. startsWith: same traversal but return true as long as the prefix path exists, regardless of isEnd.",
    timeComplexity: "O(m) per operation, where m is word length",
    spaceComplexity: "O(n * m) total for n words",
  },
  {
    id: "lc-84",
    title: "Largest Rectangle in Histogram",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    difficulty: "Hard",
    tags: ["Stack", "Arrays"],
    description:
      "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "The largest rectangle has area = 10 units (bars at index 2 and 3 with height 5)." },
      { input: "heights = [2,4]", output: "4" },
    ],
    constraints: ["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
    hint1: "Use a stack to keep track of bars in increasing height order.",
    hint2: "When a bar is shorter than the stack top, pop and calculate the area with the popped bar as the shortest bar. The width extends from the current stack top to the current index.",
    solutionParts: [
      `#include <vector>
#include <stack>
using namespace std;

class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        stack<int> st;
        int maxArea = 0;
        int n = heights.size();`,
      `        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            while (!st.empty() && h < heights[st.top()]) {
                int height = heights[st.top()]; st.pop();
                int width = st.empty() ? i : i - st.top() - 1;`,
      `                maxArea = max(maxArea, height * width);
            }
            st.push(i);
        }
        return maxArea;
    }
};`,
    ],
    fullExplanation:
      "We maintain a stack of indices in increasing height order. For each bar, if it's shorter than the top of the stack, we pop and compute the area for the popped bar. The height is the popped bar's height. The width extends from the current stack top + 1 to the current index - 1. We append a zero-height sentinel at the end to flush all remaining bars from the stack. This ensures every bar is considered as a potential shortest bar in some rectangle.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
];

export default questions;
