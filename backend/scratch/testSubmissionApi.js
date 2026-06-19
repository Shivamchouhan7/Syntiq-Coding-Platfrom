// Using global fetch in Node.js

async function run() {
  const host = 'http://localhost:5000';
  const email = 'testuser_123@example.com';
  const password = 'TestPassword123!';
  let token = null;

  console.log('1. Attempting login...');
  try {
    const loginRes = await fetch(`${host}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser_123', password })
    });
    
    const loginData = await loginRes.json();
    if (loginData.status === 'success') {
      token = loginData.token;
      console.log('Login successful! Token acquired.');
    } else {
      console.log('Login failed (user probably does not exist yet). Attempting signup...');
      const signupRes = await fetch(`${host}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: 'Test User',
          username: 'testuser_123',
          email,
          password
        })
      });
      const signupData = await signupRes.json();
      if (signupData.status === 'success') {
        token = signupData.token;
        console.log('Signup successful! Token acquired.');
      } else {
        throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
      }
    }

    console.log('2. Submitting Two Sum JavaScript solution to local Judge0...');
    const sourceCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
    `.trim();

    const submitRes = await fetch(`${host}/api/submissions/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        problemId: 'two-sum',
        language: 'javascript',
        sourceCode
      })
    });

    const submitData = await submitRes.json();
    console.log('Response from backend submission API:', JSON.stringify(submitData, null, 2));

    if (submitData.status === 'success' && submitData.verdict === 'ACCEPTED') {
      console.log('🎉 SUCCESS! End-to-end local Judge0 execution works perfectly!');
    } else {
      console.error('❌ FAILED! Submission was not accepted or failed.');
    }

  } catch (err) {
    console.error('Error in API testing:', err.message);
  }
}

run();
