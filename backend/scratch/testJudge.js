import 'dotenv/config';
import { submitCode, pollSubmission, getFinalResult } from '../src/services/judge0.service.js';

async function main() {
  const code = `
  console.log("Hello from Judge0!");
  `;
  const languageId = 63; // Javascript

  console.log('1. Submitting code to local Judge0 (Base URL:', process.env.JUDGE0_API_URL, ')...');
  try {
    const token = await submitCode(code, languageId);
    console.log('Success! Token received:', token);

    console.log('2. Polling submission status...');
    const rawResult = await pollSubmission(token);
    console.log('Success! Raw result received:', JSON.stringify(rawResult, null, 2));

    console.log('3. Decoding result...');
    const result = getFinalResult(rawResult);
    console.log('Final result:', result);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

main();
