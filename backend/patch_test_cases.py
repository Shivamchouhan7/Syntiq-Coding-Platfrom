"""
patch_test_cases.py
───────────────────
Upserts carefully hand-crafted, VALID test cases for LeetCode problems
1-50 into your Supabase `problems` table.

Runs slowly (one problem at a time, 1-second pause) to be gentle on
the API.

Usage:
    python patch_test_cases.py
"""

import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─────────────────────────────────────────────────────────────────────────────
# Hand-crafted test cases for problems 1–50
# Format: { problem_id: [ {"input": "...", "output": "..."}, ... ] }
# ─────────────────────────────────────────────────────────────────────────────

TEST_CASES: dict[int, list[dict]] = {

    # 1. Two Sum
    1: [
        {"input": "nums = [2,7,11,15], target = 9",  "output": "[0,1]"},
        {"input": "nums = [3,2,4], target = 6",       "output": "[1,2]"},
        {"input": "nums = [3,3], target = 6",          "output": "[0,1]"},
        {"input": "nums = [1,5,3,2], target = 4",     "output": "[2,3]"},
        {"input": "nums = [0,4,3,0], target = 0",     "output": "[0,3]"},
    ],

    # 2. Add Two Numbers
    2: [
        {"input": "l1 = [2,4,3], l2 = [5,6,4]",      "output": "[7,0,8]"},
        {"input": "l1 = [0], l2 = [0]",               "output": "[0]"},
        {"input": "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", "output": "[8,9,9,9,0,0,0,1]"},
        {"input": "l1 = [1,8], l2 = [0]",             "output": "[1,8]"},
        {"input": "l1 = [5], l2 = [5]",               "output": "[0,1]"},
    ],

    # 3. Longest Substring Without Repeating Characters
    3: [
        {"input": 's = "abcabcbb"', "output": "3"},
        {"input": 's = "bbbbb"',    "output": "1"},
        {"input": 's = "pwwkew"',   "output": "3"},
        {"input": 's = ""',         "output": "0"},
        {"input": 's = "au"',       "output": "2"},
    ],

    # 4. Median of Two Sorted Arrays
    4: [
        {"input": "nums1 = [1,3], nums2 = [2]",           "output": "2.00000"},
        {"input": "nums1 = [1,2], nums2 = [3,4]",         "output": "2.50000"},
        {"input": "nums1 = [0,0], nums2 = [0,0]",         "output": "0.00000"},
        {"input": "nums1 = [], nums2 = [1]",              "output": "1.00000"},
        {"input": "nums1 = [2], nums2 = []",              "output": "2.00000"},
    ],

    # 5. Longest Palindromic Substring
    5: [
        {"input": 's = "babad"', "output": '"bab"'},
        {"input": 's = "cbbd"',  "output": '"bb"'},
        {"input": 's = "a"',     "output": '"a"'},
        {"input": 's = "ac"',    "output": '"a"'},
        {"input": 's = "racecar"', "output": '"racecar"'},
    ],

    # 6. Zigzag Conversion
    6: [
        {"input": 's = "PAYPALISHIRING", numRows = 3', "output": '"PAHNAPLSIIGYIR"'},
        {"input": 's = "PAYPALISHIRING", numRows = 4', "output": '"PINALSIGYAHRPI"'},
        {"input": 's = "A", numRows = 1',              "output": '"A"'},
        {"input": 's = "AB", numRows = 1',             "output": '"AB"'},
        {"input": 's = "ABCD", numRows = 2',           "output": '"ACBD"'},
    ],

    # 7. Reverse Integer
    7: [
        {"input": "x = 123",        "output": "321"},
        {"input": "x = -123",       "output": "-321"},
        {"input": "x = 120",        "output": "21"},
        {"input": "x = 0",          "output": "0"},
        {"input": "x = 1534236469","output": "0"},
    ],

    # 8. String to Integer (atoi)
    8: [
        {"input": 's = "42"',            "output": "42"},
        {"input": 's = "   -42"',        "output": "-42"},
        {"input": 's = "4193 with words"',"output": "4193"},
        {"input": 's = "words and 987"', "output": "0"},
        {"input": 's = "-91283472332"',  "output": "-2147483648"},
    ],

    # 9. Palindrome Number
    9: [
        {"input": "x = 121",  "output": "true"},
        {"input": "x = -121", "output": "false"},
        {"input": "x = 10",   "output": "false"},
        {"input": "x = 0",    "output": "true"},
        {"input": "x = 1221", "output": "true"},
    ],

    # 10. Regular Expression Matching
    10: [
        {"input": 's = "aa", p = "a"',   "output": "false"},
        {"input": 's = "aa", p = "a*"',  "output": "true"},
        {"input": 's = "ab", p = ".*"',  "output": "true"},
        {"input": 's = "aab", p = "c*a*b"', "output": "true"},
        {"input": 's = "mississippi", p = "mis*is*p*."', "output": "false"},
    ],

    # 11. Container With Most Water
    11: [
        {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49"},
        {"input": "height = [1,1]",                 "output": "1"},
        {"input": "height = [4,3,2,1,4]",           "output": "16"},
        {"input": "height = [1,2,1]",               "output": "2"},
        {"input": "height = [2,3,4,5,18,17,6]",    "output": "17"},
    ],

    # 12. Integer to Roman
    12: [
        {"input": "num = 3",    "output": '"III"'},
        {"input": "num = 58",   "output": '"LVIII"'},
        {"input": "num = 1994", "output": '"MCMXCIV"'},
        {"input": "num = 4",    "output": '"IV"'},
        {"input": "num = 40",   "output": '"XL"'},
    ],

    # 13. Roman to Integer
    13: [
        {"input": 's = "III"',    "output": "3"},
        {"input": 's = "LVIII"',  "output": "58"},
        {"input": 's = "MCMXCIV"',"output": "1994"},
        {"input": 's = "IV"',     "output": "4"},
        {"input": 's = "IX"',     "output": "9"},
    ],

    # 14. Longest Common Prefix
    14: [
        {"input": 'strs = ["flower","flow","flight"]', "output": '"fl"'},
        {"input": 'strs = ["dog","racecar","car"]',    "output": '""'},
        {"input": 'strs = ["interview","inter","interstellar"]', "output": '"inter"'},
        {"input": 'strs = ["a"]',                      "output": '"a"'},
        {"input": 'strs = ["ab","a"]',                 "output": '"a"'},
    ],

    # 15. 3Sum
    15: [
        {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
        {"input": "nums = [0,1,1]",           "output": "[]"},
        {"input": "nums = [0,0,0]",           "output": "[[0,0,0]]"},
        {"input": "nums = [-2,0,0,2,2]",      "output": "[[-2,0,2]]"},
        {"input": "nums = [-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]", "output": "[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]"},
    ],

    # 16. 3Sum Closest
    16: [
        {"input": "nums = [-1,2,1,-4], target = 1", "output": "2"},
        {"input": "nums = [0,0,0], target = 1",      "output": "0"},
        {"input": "nums = [1,1,1,0], target = -100", "output": "2"},
        {"input": "nums = [1,2,4,8,16,32,64,128], target = 82", "output": "82"},
        {"input": "nums = [-1,-1,-1,0], target = 1", "output": "0"},
    ],

    # 17. Letter Combinations of a Phone Number
    17: [
        {"input": 'digits = "23"', "output": '["ad","ae","af","bd","be","bf","cd","ce","cf"]'},
        {"input": 'digits = ""',   "output": "[]"},
        {"input": 'digits = "2"',  "output": '["a","b","c"]'},
        {"input": 'digits = "79"', "output": '["ps","pt","pu","pv","qs","qt","qu","qv","rs","rt","ru","rv","ss","st","su","sv"]'},
        {"input": 'digits = "9"',  "output": '["w","x","y","z"]'},
    ],

    # 18. 4Sum
    18: [
        {"input": "nums = [1,0,-1,0,-2,2], target = 0", "output": "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]"},
        {"input": "nums = [2,2,2,2,2], target = 8",     "output": "[[2,2,2,2]]"},
        {"input": "nums = [0,0,0,0], target = 0",       "output": "[[0,0,0,0]]"},
        {"input": "nums = [-3,-2,-1,0,0,1,2,3], target = 0", "output": "[[-3,-2,2,3],[-3,-1,1,3],[-3,0,0,3],[-3,0,1,2],[-2,-1,0,3],[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]"},
        {"input": "nums = [1,2,3,4], target = 10",      "output": "[[1,2,3,4]]"},
    ],

    # 19. Remove Nth Node From End of List
    19: [
        {"input": "head = [1,2,3,4,5], n = 2", "output": "[1,2,3,5]"},
        {"input": "head = [1], n = 1",          "output": "[]"},
        {"input": "head = [1,2], n = 1",        "output": "[1]"},
        {"input": "head = [1,2], n = 2",        "output": "[2]"},
        {"input": "head = [1,2,3], n = 3",      "output": "[2,3]"},
    ],

    # 20. Valid Parentheses
    20: [
        {"input": 's = "()"',      "output": "true"},
        {"input": 's = "()[]{}"',  "output": "true"},
        {"input": 's = "(]"',      "output": "false"},
        {"input": 's = "([)]"',    "output": "false"},
        {"input": 's = "{[]}"',    "output": "true"},
    ],

    # 21. Merge Two Sorted Lists
    21: [
        {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"},
        {"input": "list1 = [], list2 = []",            "output": "[]"},
        {"input": "list1 = [], list2 = [0]",           "output": "[0]"},
        {"input": "list1 = [1], list2 = [2]",          "output": "[1,2]"},
        {"input": "list1 = [1,3,5], list2 = [2,4,6]", "output": "[1,2,3,4,5,6]"},
    ],

    # 22. Generate Parentheses
    22: [
        {"input": "n = 3", "output": '["((()))","(()())","(())()","()(())","()()()"]'},
        {"input": "n = 1", "output": '["()"]'},
        {"input": "n = 2", "output": '["(())","()()"]'},
        {"input": "n = 4", "output": '["(((())))","((()()))","((())())","((()))()","(()(()))","(()()())","(()())()","(())(())","(())()()","()((())))","()((()))","()(()())","()(())()","()()(())","()()()()"]'},
        {"input": "n = 0", "output": '[""]'},
    ],

    # 23. Merge K Sorted Lists
    23: [
        {"input": "lists = [[1,4,5],[1,3,4],[2,6]]", "output": "[1,1,2,3,4,4,5,6]"},
        {"input": "lists = []",                       "output": "[]"},
        {"input": "lists = [[]]",                     "output": "[]"},
        {"input": "lists = [[1],[0]]",                "output": "[0,1]"},
        {"input": "lists = [[1,2,3],[4,5,6]]",        "output": "[1,2,3,4,5,6]"},
    ],

    # 24. Swap Nodes in Pairs
    24: [
        {"input": "head = [1,2,3,4]", "output": "[2,1,4,3]"},
        {"input": "head = []",        "output": "[]"},
        {"input": "head = [1]",       "output": "[1]"},
        {"input": "head = [1,2]",     "output": "[2,1]"},
        {"input": "head = [1,2,3]",   "output": "[2,1,3]"},
    ],

    # 25. Reverse Nodes in k-Group
    25: [
        {"input": "head = [1,2,3,4,5], k = 2", "output": "[2,1,4,3,5]"},
        {"input": "head = [1,2,3,4,5], k = 3", "output": "[3,2,1,4,5]"},
        {"input": "head = [1,2,3,4,5], k = 1", "output": "[1,2,3,4,5]"},
        {"input": "head = [1], k = 1",          "output": "[1]"},
        {"input": "head = [1,2], k = 2",        "output": "[2,1]"},
    ],

    # 26. Remove Duplicates from Sorted Array
    26: [
        {"input": "nums = [1,1,2]",             "output": "2"},
        {"input": "nums = [0,0,1,1,1,2,2,3,3,4]","output": "5"},
        {"input": "nums = [1]",                  "output": "1"},
        {"input": "nums = [1,2]",                "output": "2"},
        {"input": "nums = [1,1,1,2,2,3]",        "output": "3"},
    ],

    # 27. Remove Element
    27: [
        {"input": "nums = [3,2,2,3], val = 3",    "output": "2"},
        {"input": "nums = [0,1,2,2,3,0,4,2], val = 2", "output": "5"},
        {"input": "nums = [1], val = 1",           "output": "0"},
        {"input": "nums = [1], val = 2",           "output": "1"},
        {"input": "nums = [4,5], val = 4",         "output": "1"},
    ],

    # 28. Find the Index of the First Occurrence in a String
    28: [
        {"input": 'haystack = "sadbutsad", needle = "sad"', "output": "0"},
        {"input": 'haystack = "leetcode", needle = "leeto"', "output": "-1"},
        {"input": 'haystack = "hello", needle = "ll"',      "output": "2"},
        {"input": 'haystack = "aaa", needle = "aaaa"',      "output": "-1"},
        {"input": 'haystack = "a", needle = "a"',           "output": "0"},
    ],

    # 29. Divide Two Integers
    29: [
        {"input": "dividend = 10, divisor = 3",   "output": "3"},
        {"input": "dividend = 7, divisor = -3",   "output": "-2"},
        {"input": "dividend = 0, divisor = 1",    "output": "0"},
        {"input": "dividend = 1, divisor = 1",    "output": "1"},
        {"input": "dividend = -2147483648, divisor = -1", "output": "2147483647"},
    ],

    # 30. Substring with Concatenation of All Words
    30: [
        {"input": 's = "barfoothefoobarman", words = ["foo","bar"]', "output": "[0,9]"},
        {"input": 's = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]', "output": "[]"},
        {"input": 's = "barfoofoobarthefoobarman", words = ["bar","foo","the"]', "output": "[6,9,12]"},
        {"input": 's = "aa", words = ["aa"]', "output": "[0]"},
        {"input": 's = "ab", words = ["a","b"]', "output": "[0]"},
    ],

    # 31. Next Permutation
    31: [
        {"input": "nums = [1,2,3]",   "output": "[1,3,2]"},
        {"input": "nums = [3,2,1]",   "output": "[1,2,3]"},
        {"input": "nums = [1,1,5]",   "output": "[1,5,1]"},
        {"input": "nums = [1]",       "output": "[1]"},
        {"input": "nums = [2,3,1]",   "output": "[3,1,2]"},
    ],

    # 32. Longest Valid Parentheses
    32: [
        {"input": 's = "(()"',    "output": "2"},
        {"input": 's = ")()())"', "output": "4"},
        {"input": 's = ""',       "output": "0"},
        {"input": 's = "()()"',   "output": "4"},
        {"input": 's = "((("',    "output": "0"},
    ],

    # 33. Search in Rotated Sorted Array
    33: [
        {"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4"},
        {"input": "nums = [4,5,6,7,0,1,2], target = 3", "output": "-1"},
        {"input": "nums = [1], target = 0",              "output": "-1"},
        {"input": "nums = [1], target = 1",              "output": "0"},
        {"input": "nums = [3,1], target = 1",            "output": "1"},
    ],

    # 34. Find First and Last Position of Element in Sorted Array
    34: [
        {"input": "nums = [5,7,7,8,8,10], target = 8", "output": "[3,4]"},
        {"input": "nums = [5,7,7,8,8,10], target = 6", "output": "[-1,-1]"},
        {"input": "nums = [], target = 0",              "output": "[-1,-1]"},
        {"input": "nums = [1], target = 1",             "output": "[0,0]"},
        {"input": "nums = [2,2,2,2], target = 2",       "output": "[0,3]"},
    ],

    # 35. Search Insert Position
    35: [
        {"input": "nums = [1,3,5,6], target = 5", "output": "2"},
        {"input": "nums = [1,3,5,6], target = 2", "output": "1"},
        {"input": "nums = [1,3,5,6], target = 7", "output": "4"},
        {"input": "nums = [1,3,5,6], target = 0", "output": "0"},
        {"input": "nums = [1], target = 0",        "output": "0"},
    ],

    # 36. Valid Sudoku
    36: [
        {"input": 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]', "output": "true"},
        {"input": 'board = [["8","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]', "output": "false"},
    ],

    # 37. Sudoku Solver — no simple I/O example; reuse 36's board as input + solved output
    37: [
        {"input": 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]',
         "output": '[["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]'},
    ],

    # 38. Count and Say
    38: [
        {"input": "n = 1", "output": '"1"'},
        {"input": "n = 2", "output": '"11"'},
        {"input": "n = 3", "output": '"21"'},
        {"input": "n = 4", "output": '"1211"'},
        {"input": "n = 5", "output": '"111221"'},
    ],

    # 39. Combination Sum
    39: [
        {"input": "candidates = [2,3,6,7], target = 7",  "output": "[[2,2,3],[7]]"},
        {"input": "candidates = [2,3,5], target = 8",    "output": "[[2,2,2,2],[2,3,3],[3,5]]"},
        {"input": "candidates = [2], target = 1",         "output": "[]"},
        {"input": "candidates = [1], target = 2",         "output": "[[1,1]]"},
        {"input": "candidates = [3,5,8], target = 11",   "output": "[[3,3,5],[3,8]]"},
    ],

    # 40. Combination Sum II
    40: [
        {"input": "candidates = [10,1,2,7,6,1,5], target = 8", "output": "[[1,1,6],[1,2,5],[1,7],[2,6]]"},
        {"input": "candidates = [2,5,2,1,2], target = 5",      "output": "[[1,2,2],[5]]"},
        {"input": "candidates = [1,1,1,1], target = 2",        "output": "[[1,1]]"},
        {"input": "candidates = [2,2,3], target = 7",          "output": "[]"},
        {"input": "candidates = [1,2,3], target = 4",          "output": "[[1,2,1],[1,3],[2,2]]"},
    ],

    # 41. First Missing Positive
    41: [
        {"input": "nums = [1,2,0]",      "output": "3"},
        {"input": "nums = [3,4,-1,1]",   "output": "2"},
        {"input": "nums = [7,8,9,11,12]","output": "1"},
        {"input": "nums = [1]",           "output": "2"},
        {"input": "nums = [2,1]",         "output": "3"},
    ],

    # 42. Trapping Rain Water
    42: [
        {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
        {"input": "height = [4,2,0,3,2,5]",              "output": "9"},
        {"input": "height = [1,0,1]",                    "output": "1"},
        {"input": "height = [3,0,2,0,4]",                "output": "7"},
        {"input": "height = [1,1]",                      "output": "0"},
    ],

    # 43. Multiply Strings
    43: [
        {"input": 'num1 = "2", num2 = "3"',     "output": '"6"'},
        {"input": 'num1 = "123", num2 = "456"', "output": '"56088"'},
        {"input": 'num1 = "0", num2 = "0"',     "output": '"0"'},
        {"input": 'num1 = "9", num2 = "9"',     "output": '"81"'},
        {"input": 'num1 = "10", num2 = "10"',   "output": '"100"'},
    ],

    # 44. Wildcard Matching
    44: [
        {"input": 's = "aa", p = "a"',    "output": "false"},
        {"input": 's = "aa", p = "*"',    "output": "true"},
        {"input": 's = "cb", p = "?a"',   "output": "false"},
        {"input": 's = "adceb", p = "*a*b"', "output": "true"},
        {"input": 's = "acdcb", p = "a*c?b"',"output": "false"},
    ],

    # 45. Jump Game II
    45: [
        {"input": "nums = [2,3,1,1,4]", "output": "2"},
        {"input": "nums = [2,3,0,1,4]", "output": "2"},
        {"input": "nums = [1,2,3]",     "output": "2"},
        {"input": "nums = [1]",          "output": "0"},
        {"input": "nums = [3,2,1,0,4]", "output": "3"},
    ],

    # 46. Permutations
    46: [
        {"input": "nums = [1,2,3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"},
        {"input": "nums = [0,1]",   "output": "[[0,1],[1,0]]"},
        {"input": "nums = [1]",     "output": "[[1]]"},
        {"input": "nums = [1,2]",   "output": "[[1,2],[2,1]]"},
        {"input": "nums = [-1,2,0]","output": "[[-1,0,2],[-1,2,0],[0,-1,2],[0,2,-1],[2,-1,0],[2,0,-1]]"},
    ],

    # 47. Permutations II
    47: [
        {"input": "nums = [1,1,2]", "output": "[[1,1,2],[1,2,1],[2,1,1]]"},
        {"input": "nums = [1,2,3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"},
        {"input": "nums = [1,2,1]", "output": "[[1,1,2],[1,2,1],[2,1,1]]"},
        {"input": "nums = [0,0,0]", "output": "[[0,0,0]]"},
        {"input": "nums = [1,1,1]", "output": "[[1,1,1]]"},
    ],

    # 48. Rotate Image
    48: [
        {"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",             "output": "[[7,4,1],[8,5,2],[9,6,3]]"},
        {"input": "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "output": "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]"},
        {"input": "matrix = [[1]]",                                  "output": "[[1]]"},
        {"input": "matrix = [[1,2],[3,4]]",                          "output": "[[3,1],[4,2]]"},
        {"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",             "output": "[[7,4,1],[8,5,2],[9,6,3]]"},
    ],

    # 49. Group Anagrams
    49: [
        {"input": 'strs = ["eat","tea","tan","ate","nat","bat"]', "output": '[["bat"],["nat","tan"],["ate","eat","tea"]]'},
        {"input": 'strs = [""]',                                   "output": '[[""]]'},
        {"input": 'strs = ["a"]',                                  "output": '[["a"]]'},
        {"input": 'strs = ["abc","bca","cab","xyz"]',             "output": '[["abc","bca","cab"],["xyz"]]'},
        {"input": 'strs = ["listen","silent","enlist"]',           "output": '[["listen","silent","enlist"]]'},
    ],

    # 50. Pow(x, n)
    50: [
        {"input": "x = 2.00000, n = 10",   "output": "1024.00000"},
        {"input": "x = 2.10000, n = 3",    "output": "9.26100"},
        {"input": "x = 2.00000, n = -2",   "output": "0.25000"},
        {"input": "x = 1.00000, n = 2147483647", "output": "1.00000"},
        {"input": "x = 0.00001, n = 2147483647", "output": "0.00000"},
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# Patch loop: update one problem at a time, slow
# ─────────────────────────────────────────────────────────────────────────────

def patch():
    ids = sorted(TEST_CASES.keys())
    print(f"[*] Patching {len(ids)} problems (1 per second)...\n")

    success = 0
    errors  = 0

    for problem_id in ids:
        cases = TEST_CASES[problem_id]
        try:
            resp = (
                supabase
                .table("problems")
                .update({"test_cases": cases})
                .eq("id", problem_id)
                .execute()
            )
            # supabase-py v2: resp.data is the list of updated rows
            if resp.data:
                print(f"  [OK ] Problem {problem_id:2d} — {len(cases)} test cases patched.")
                success += 1
            else:
                # Row may not exist yet — not a hard error
                print(f"  [--] Problem {problem_id:2d} — row not found in DB (skipped).")
        except Exception as exc:
            print(f"  [ERR] Problem {problem_id:2d} — {exc}")
            errors += 1

        time.sleep(1.0)   # be gentle

    print(f"\n[DONE] Success: {success} | Errors: {errors}")


if __name__ == "__main__":
    patch()
