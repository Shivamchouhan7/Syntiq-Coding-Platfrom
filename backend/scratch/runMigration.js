import prisma from '../src/utils/prisma.js';

const sql = `
INSERT INTO problems (
  id,
  title,
  difficulty,
  acceptance,
  category,
  statement,
  constraints,
  starter_code,
  test_cases,
  editorial,
  input_example,
  output_example,
  slug,
  function_name,
  return_type,
  parameters,
  visible_test_cases,
  hidden_test_cases,
  tags
) VALUES (
  'two-sum',
  'Two Sum',
  'Easy',
  '49.1%',
  'Arrays',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
  '["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."]'::jsonb,
  '{
    "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n    // Write your code here\\n}",
    "python": "class Solution:\\n    def twoSum(self, nums: list, target: int) -> list:\\n        pass",
    "cpp": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        // Write your code here\\n    }\\n};",
    "java": "class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // Write your code here\\n    }\\n}"
  }',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}, {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}]',
  'Use a hash map to store each number and its index as you iterate through nums. For each element, check if (target - element) already exists in the map. If it does, return the current index and the stored index. Time: O(n), Space: O(n).',
  'nums = [2,7,11,15], target = 9',
  '[0,1]',
  'two-sum',
  'twoSum',
  'vector<int>',
  '[{"name": "nums", "type": "vector<int>"}, {"name": "target", "type": "int"}]',
  '[
    {"input": "[2,7,11,15]\\n9", "expectedOutput": "[0,1]"},
    {"input": "[3,2,4]\\n6", "expectedOutput": "[1,2]"}
  ]',
  '[
    {"input": "[2,7,11,15]\\n9", "expectedOutput": "[0,1]"},
    {"input": "[3,2,4]\\n6", "expectedOutput": "[1,2]"},
    {"input": "[3,3]\\n6", "expectedOutput": "[0,1]"},
    {"input": "[0,4,3,0]\\n0", "expectedOutput": "[0,3]"},
    {"input": "[-1,-2,-3,-4,-5]\\n-8", "expectedOutput": "[2,4]"},
    {"input": "[1,5,3,2,4]\\n6", "expectedOutput": "[0,1]"},
    {"input": "[0,0]\\n0", "expectedOutput": "[0,1]"},
    {"input": "[1000000000,-1000000000]\\n0", "expectedOutput": "[0,1]"}
  ]',
  ARRAY['array', 'hash-table']
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  function_name = EXCLUDED.function_name,
  return_type = EXCLUDED.return_type,
  parameters = EXCLUDED.parameters,
  visible_test_cases = EXCLUDED.visible_test_cases,
  hidden_test_cases = EXCLUDED.hidden_test_cases,
  tags = EXCLUDED.tags;
`;

async function main() {
  console.log('Inserting Two Sum problem with judge fields (fixed constraints type)...');
  try {
    const result = await prisma.$executeRawUnsafe(sql);
    console.log('Success! Result:', result);
  } catch (error) {
    console.error('Error running SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
