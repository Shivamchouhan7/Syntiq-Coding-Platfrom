export const MOCK_PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: "49.2%",
    recommended: true,
    status: "solved", // solved, attempted, new
    category: "Arrays",
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    inputExample: "nums = [2,7,11,15], target = 9",
    outputExample: "[0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n    // Write your code here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      python: `def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    unordered_map<int, int> prev;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (prev.find(diff) != prev.end()) {\n            return {prev[diff], i};\n        }\n        prev[nums[i]] = i;\n    }\n    return {};\n}`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "[0,1]", status: "passed", runtime: "4ms", memory: "41.2 MB" },
      { id: 2, name: "Case 2", input: "nums = [3,2,4], target = 6", expected: "[1,2]", actual: "[1,2]", status: "passed", runtime: "6ms", memory: "41.5 MB" },
      { id: 3, name: "Case 3", input: "nums = [3,3], target = 6", expected: "[0,1]", actual: "[0,1]", status: "passed", runtime: "4ms", memory: "40.9 MB" }
    ],
    editorial: "### Dynamic Hash Map Approach\nInstead of checking every pair which would take O(N^2) time, we can keep track of numbers we have already seen in a Hash Map. For each number `x`, we check if the complement `target - x` is present in our map. If it is, we have found our answer. Otherwise, we add `x` to the map.\n\n- **Time Complexity:** O(N) because we iterate through the array once and perform O(1) hash map operations.\n- **Space Complexity:** O(N) since in the worst case we store all elements in the hash map.",
    discussion: [
      { user: "codegod_99", avatar: "C", text: "Is there an in-place solution with O(1) space if the array is sorted?", time: "2 hours ago", replies: [
          { user: "syntax_sentinel", avatar: "S", text: "Yes! If the array is sorted, you can use the two-pointer technique to solve it in O(1) space and O(N) time.", time: "1 hour ago" }
        ]
      },
      { user: "novice_coder", avatar: "N", text: "Loved the AI feedback panel! It helped me realize why my nested loop was hitting Time Limit Exceeded.", time: "1 day ago" }
    ]
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    acceptance: "32.4%",
    recommended: true,
    status: "attempted",
    category: "Strings",
    statement: "Given a string `s`, return the longest palindromic substring in `s`.\n\nA palindrome is a string that reads the same backward as forward.",
    inputExample: "s = \"babad\"",
    outputExample: "\"bab\"\nExplanation: \"aba\" is also a valid answer.",
    constraints: [
      "1 <= s.length <= 1000",
      "s consists of only digits and English letters."
    ],
    starterCode: {
      javascript: `function longestPalindrome(s) {\n    // Write your code here\n}`,
      python: `def longestPalindrome(s: str) -> str:\n    # Write your code here`,
      cpp: `string longestPalindrome(string s) {\n    // Write your code here\n}`,
      java: `class Solution {\n    public String longestPalindrome(String s) {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "s = \"babad\"", expected: "\"bab\" or \"aba\"", actual: "\"bab\"", status: "passed", runtime: "28ms", memory: "44.5 MB" },
      { id: 2, name: "Case 2", input: "s = \"cbbd\"", expected: "\"bb\"", actual: "\"bb\"", status: "passed", runtime: "12ms", memory: "42.1 MB" }
    ],
    editorial: "### Dynamic Programming or Expand Around Center\nWe can solve this problem in O(N^2) time and O(1) space by treating each character (and each gap between characters) as the potential center of a palindrome, and expanding outwards. there are `2N - 1` such centers.",
    discussion: []
  },
  {
    id: "edit-distance",
    title: "Edit Distance",
    difficulty: "Hard",
    acceptance: "52.8%",
    recommended: false,
    status: "new",
    category: "DP",
    statement: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character",
    inputExample: "word1 = \"horse\", word2 = \"ros\"",
    outputExample: "3\nExplanation:\nhorse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')",
    constraints: [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters."
    ],
    starterCode: {
      javascript: `function minDistance(word1, word2) {\n    // Write your code here\n}`,
      python: `def minDistance(word1: str, word2: str) -> int:\n    # Write your code here`,
      cpp: `int minDistance(string word1, string word2) {\n    // Write your code here\n}`,
      java: `class Solution {\n    public int minDistance(String word1, String word2) {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "word1 = \"horse\", word2 = \"ros\"", expected: "3", actual: "", status: "failed", runtime: "N/A", memory: "N/A" }
    ],
    editorial: "### Dynamic Programming\nDefine `dp[i][j]` as the edit distance between `word1[0...i-1]` and `word2[0...j-1]`. If the last characters match, `dp[i][j] = dp[i-1][j-1]`. Otherwise, we choose the minimum of insert, delete, and replace, which is `1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])`.",
    discussion: []
  },
  {
    id: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    acceptance: "61.9%",
    recommended: true,
    status: "solved",
    category: "Trees",
    statement: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    inputExample: "root = [3,9,20,null,null,15,7]",
    outputExample: "[[3],[9,20],[15,7]]",
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000"
    ],
    starterCode: {
      javascript: `function levelOrder(root) {\n    // Write your code here\n}`,
      python: `def levelOrder(root: Optional[TreeNode]) -> List[List[int]]:\n    # Write your code here`,
      cpp: `vector<vector<int>> levelOrder(TreeNode* root) {\n    // Write your code here\n}`,
      java: `class Solution {\n    public List<List<int[]>> levelOrder(TreeNode root) {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "root = [3,9,20,null,null,15,7]", expected: "[[3],[9,20],[15,7]]", actual: "[[3],[9,20],[15,7]]", status: "passed", runtime: "8ms", memory: "43.5 MB" }
    ],
    editorial: "### BFS Queue approach\nWe use a queue to traverse the tree level by level. In each iteration, we count the size of the queue which corresponds to the number of nodes on the current level, pop them, add their values to a list, and push their children to the queue.",
    discussion: []
  },
  {
    id: "graph-valid-tree",
    title: "Graph Valid Tree",
    difficulty: "Medium",
    acceptance: "46.2%",
    recommended: false,
    status: "new",
    category: "Graphs",
    statement: "Given `n` nodes labeled from `0` to `n - 1` and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.",
    inputExample: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
    outputExample: "true\nExplanation: There are no cycles and all nodes are connected.",
    constraints: [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000",
      "edges[i].length == 2"
    ],
    starterCode: {
      javascript: `function validTree(n, edges) {\n    // Write your code here\n}`,
      python: `def validTree(n: int, edges: List[List[int]]) -> bool:\n    # Write your code here`,
      cpp: `bool validTree(int n, vector<vector<int>>& edges) {\n    // Write your code here\n}`,
      java: `class Solution {\n    public boolean validTree(int n, int[][] edges) {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", expected: "true", actual: "", status: "new", runtime: "0ms", memory: "0MB" }
    ],
    editorial: "### Union Find / DFS\nA graph is a valid tree if and only if:\n1. It has exactly `n - 1` edges.\n2. It has no cycles and is fully connected.\nWe can verify this using a Union-Find data structure or BFS/DFS.",
    discussion: []
  },
  {
    id: "merge-sort",
    title: "Merge Sort Implementation",
    difficulty: "Easy",
    acceptance: "74.8%",
    recommended: true,
    status: "solved",
    category: "Sorting",
    statement: "Implement Merge Sort. Given an array of integers, sort the array in ascending order and return it.",
    inputExample: "nums = [5,2,3,1]",
    outputExample: "[1,2,3,5]",
    constraints: [
      "1 <= nums.length <= 5 * 10^4",
      "-5 * 10^4 <= nums[i] <= 5 * 10^4"
    ],
    starterCode: {
      javascript: `function sortArray(nums) {\n    // Write your code here\n}`,
      python: `def sortArray(nums: List[int]) -> List[int]:\n    # Write your code here`,
      cpp: `vector<int> sortArray(vector<int>& nums) {\n    // Write your code here\n}`,
      java: `class Solution {\n    public int[] sortArray(int[] nums) {\n        // Write your code here\n    }\n}`
    },
    testCases: [
      { id: 1, name: "Case 1", input: "nums = [5,2,3,1]", expected: "[1,2,3,5]", actual: "[1,2,3,5]", status: "passed", runtime: "14ms", memory: "48.2 MB" }
    ],
    editorial: "### Divide and Conquer\nSplit the array into two halves, recursively sort each half, and then merge the sorted halves using a two-pointer merge operation.",
    discussion: []
  }
];

export const MOCK_CONTESTS = [
  {
    id: "c1",
    name: "Weekly Byte Contest 48",
    status: "live",
    countdown: "00:45:12",
    duration: "90 mins",
    difficulty: "Medium",
    participants: 1420,
    registered: true,
    problems: ["two-sum", "longest-palindromic-substring", "binary-tree-level-order", "edit-distance"],
    scoreboard: [
      { rank: 1, username: "competitive_wizard", avatar: "C", solved: ["P1", "P2", "P3", "P4"], penalty: 68, lastSubmit: "00:38:12", color: "from-yellow-400 to-amber-600" },
      { rank: 2, username: "algo_genius", avatar: "A", solved: ["P1", "P2", "P3"], penalty: 42, lastSubmit: "00:34:10", color: "from-slate-300 to-slate-400" },
      { rank: 3, username: "rust_god", avatar: "R", solved: ["P1", "P2", "P3"], penalty: 55, lastSubmit: "00:41:00", color: "from-amber-600 to-amber-700" },
      { rank: 4, username: "coding_yoda", avatar: "Y", solved: ["P1", "P3"], penalty: 30, lastSubmit: "00:22:15" },
      { rank: 5, username: "current_user", avatar: "U", solved: ["P1"], penalty: 12, lastSubmit: "00:11:45" }
    ]
  },
  {
    id: "c2",
    name: "AI Duel Masters - Arrays",
    status: "upcoming",
    countdown: "Starts in 2h 15m",
    duration: "60 mins",
    difficulty: "Easy",
    participants: 890,
    registered: false,
    problems: ["two-sum", "merge-sort"],
    scoreboard: []
  },
  {
    id: "c3",
    name: "Syntiq Grand Prix 2026",
    status: "past",
    countdown: "Ended June 5, 2026",
    duration: "180 mins",
    difficulty: "Hard",
    participants: 3120,
    registered: true,
    problems: ["edit-distance", "graph-valid-tree"],
    scoreboard: [
      { rank: 1, username: "tourist_clone", avatar: "T", solved: ["P1", "P2"], penalty: 82, lastSubmit: "02:12:05" },
      { rank: 2, username: "compiler_errors", avatar: "C", solved: ["P1"], penalty: 45, lastSubmit: "01:30:10" }
    ]
  }
];

export const GLOBAL_LEADERBOARD = [
  { rank: 1, username: "competitive_wizard", avatar: "C", solved: 482, rating: 2842, streak: 124, isFriend: false },
  { rank: 2, username: "algo_genius", avatar: "A", solved: 440, rating: 2715, streak: 89, isFriend: true },
  { rank: 3, username: "rust_god", avatar: "R", solved: 412, rating: 2680, streak: 54, isFriend: false },
  { rank: 4, username: "byte_bender", avatar: "B", solved: 395, rating: 2450, streak: 30, isFriend: true },
  { rank: 5, username: "syntax_sentinel", avatar: "S", solved: 378, rating: 2390, streak: 12, isFriend: false },
  { rank: 6, username: "loop_champion", avatar: "L", solved: 320, rating: 2150, streak: 45, isFriend: false },
  { rank: 7, username: "recursion_expert", avatar: "R", solved: 290, rating: 2020, streak: 0, isFriend: true },
  { rank: 8, username: "null_pointer", avatar: "N", solved: 265, rating: 1980, streak: 5, isFriend: false }
];

export const PROFILE_DATA = {
  username: "competitor_unleashed",
  fullname: "Alex Rivera",
  avatarColor: "#6c63ff",
  xp: 18450,
  level: 42,
  streak: 28,
  solvedCount: {
    easy: 54,
    medium: 32,
    hard: 8,
    total: 94
  },
  skills: {
    "Arrays": 85,
    "Strings": 70,
    "DP": 45,
    "Trees": 75,
    "Graphs": 60,
    "Sorting": 90
  },
  contestHistory: [
    { name: "Weekly Byte Contest 47", rank: 112, solved: 3, ratingChange: 48, currentRating: 1824 },
    { name: "Algorithmic Showdown #12", rank: 240, solved: 2, ratingChange: -15, currentRating: 1776 },
    { name: "Code Sprint May 2026", rank: 88, solved: 4, ratingChange: 92, currentRating: 1791 }
  ],
  recentSubmissions: [
    { problem: "Two Sum", status: "Accepted", lang: "JavaScript", runtime: "4ms", time: "10 mins ago" },
    { problem: "Longest Palindromic Substring", status: "Time Limit Exceeded", lang: "C++", runtime: "TLE", time: "2 hours ago" },
    { problem: "Binary Tree Level Order Traversal", status: "Accepted", lang: "Python", runtime: "12ms", time: "1 day ago" },
    { problem: "Edit Distance", status: "Wrong Answer", lang: "Java", runtime: "N/A", time: "2 days ago" }
  ],
  submissionCalendar: (() => {
    // Generate a list of dates and contribution levels (0-4) for a standard heatmap
    const dates = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 364); // One year ago
    for (let i = 0; i < 365; i++) {
      const dateStr = baseDate.toISOString().split("T")[0];
      // Generate realistic coding contributions: mostly 0s, some 1, 2, 3, 4
      const level = Math.random() < 0.65 ? 0 : Math.floor(Math.random() * 5);
      dates.push({ date: dateStr, count: level });
      baseDate.setDate(baseDate.getDate() + 1);
    }
    return dates;
  })()
};
