const API_URL = process.env.API_URL || 'http://localhost:5000/api/problems';

const problemPayload = {
  id: "palindrome-number",
  title: "Palindrome Number",
  difficulty: "Easy",
  category: "Math",
  statement: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
  constraints: [
    "-2^31 <= x <= 2^31 - 1"
  ],
  starterCode: {
    javascript: "function isPalindrome(x) {\n  // Write your code here\n}",
    python: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass"
  },
  testCases: [
    {
      id: "tc1",
      name: "Case 1",
      input: "121",
      expected: "true"
    },
    {
      id: "tc2",
      name: "Case 2",
      input: "-121",
      expected: "false"
    }
  ],
  editorial: "An integer is a palindrome when it reads the same backward as forward. For example, 121 is a palindrome while -121 is not."
};

async function seed() {
  console.log(`Sending post request to ${API_URL}...`);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(problemPayload)
    });

    const data = await response.json();
    if (data.status === 'success') {
      console.log('Problem seeded successfully! ID:', data.problem.id);
    } else {
      console.error('Seeding failed:', data.message || data);
    }
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

seed();
