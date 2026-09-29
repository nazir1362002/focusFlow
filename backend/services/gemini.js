const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateReportAndBlueprint(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const prompt = `
You are an expert focus coach. Analyze the following user data from a 7-day focus journey and generate two things:

1. A Weekly Focus Report (structured, encouraging, practical)
2. A Personal Focus Blueprint (concise and actionable)

USER DATA:
${JSON.stringify(userData, null, 2)}

Please respond in the following exact format:

=== WEEKLY REPORT ===
(Write a clear weekly report with these sections:
- Overall Assessment
- Strengths
- Areas for Improvement
- High-Impact Activities Observed
- Distraction Patterns
- Information Consumption Insights
- Specific Recommendations
- One Concrete Next Action)

=== FOCUS BLUEPRINT ===
(Write a clean personal blueprint with these exact headings:
MY MAIN GOAL
WHY IT MATTERS
MY STRENGTHS
HIGH-IMPACT ACTIVITIES
DISTRACTIONS TO REDUCE
FOCUS SCORE
NEXT ACTION)
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Split the response
  const reportMatch = text.split('=== WEEKLY REPORT ===')[1] || '';
  const parts = reportMatch.split('=== FOCUS BLUEPRINT ===');

  const weeklyReport = (parts[0] || '').trim();
  const focusBlueprint = (parts[1] || '').trim();

  return { weeklyReport, focusBlueprint };
}

module.exports = { generateReportAndBlueprint };