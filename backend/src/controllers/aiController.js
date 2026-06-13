import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const analyzeCode = async (req, res) => {
  try {
    const { problemTitle, statement, language, code } = req.body;

    if (!code) {
      return res.status(400).json({ status: 'error', message: 'Code is required' });
    }

    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an expert code reviewer for Syntiq. Review the user's code for the problem "${problemTitle}".
Here is the problem statement:
${statement}

User's Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Provide a highly concise, structured review in Markdown format with exactly these sections:
### ⏱️ Complexity Evaluation
State the Time and Space complexity using plain text like **O(N)** or **O(1)**. DO NOT use LaTeX formatting like $\\mathcal{O}$.

### 🐛 Anomalies & Corner Cases
Bullet points of potential bugs or missing edge cases.

### 💡 Optimization Tips
1-2 brief, actionable tips to improve the code.

Keep the tone direct and professional. DO NOT write conversational greetings like "Hello" or "Here is my review". Go straight into the markdown headings.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      status: 'success',
      analysis: responseText
    });
  } catch (error) {
    console.error('AI Code Analysis Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI analysis'
    });
  }
};

export const getHint = async (req, res) => {
  try {
    const { problemTitle, statement, language, code, hintLevel } = req.body;

    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let prompt = `
You are an AI tutor for a coding platform called Syntiq.
Problem: "${problemTitle}"
Problem Statement: ${statement}
User's Current Code (${language}):
\`\`\`${language}
${code}
\`\`\`

The user is stuck and requested Hint #${hintLevel} out of 3.
Hint 1 should be a very high-level conceptual nudge.
Hint 2 should describe a data structure or algorithm approach.
Hint 3 should be almost pseudo-code but not full code.

Provide ONLY Hint #${hintLevel}. Do not include other hints. Keep it short (1-3 sentences) and strictly text/markdown. Do not provide the full solution.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      status: 'success',
      hint: responseText
    });
  } catch (error) {
    console.error('AI Hint Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI hint'
    });
  }
};
