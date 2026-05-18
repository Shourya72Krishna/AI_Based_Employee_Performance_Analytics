const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// POST /api/ai/recommend
router.post("/recommend", auth, async (req, res, next) => {
  try {
    const { employees } = req.body;
    if (!employees || !employees.length)
      return res.status(400).json({ error: "Provide at least one employee." });

    const prompt = `You are an expert HR analyst. Analyze the following employee data and provide:
1. Promotion recommendation (Yes/No with reason)
2. Training suggestions (specific skills to develop)
3. AI Feedback (motivational and constructive)
4. Ranking among peers if multiple employees provided

Employee Data:
${JSON.stringify(employees, null, 2)}

Respond ONLY in this JSON format (no markdown):
{
  "rankings": [{"name": "...", "rank": 1, "score": 85}],
  "recommendations": [
    {
      "name": "...",
      "promotion": {"eligible": true, "reason": "..."},
      "training": ["skill1", "skill2"],
      "feedback": "...",
      "overallRating": "Excellent/Good/Needs Improvement"
    }
  ]
}`;

    if (!OPENROUTER_API_KEY) {
      return res.json({
        rankings: employees.map((e, i) => ({ name: e.name, rank: i + 1, score: e.performanceScore })),
        recommendations: employees.map((e) => ({
          name: e.name,
          promotion: {
            eligible: e.performanceScore >= 75,
            reason: e.performanceScore >= 75 ? "Strong performance score." : "Needs improvement first.",
          },
          training: e.performanceScore < 70 ? ["Communication", "Time Management"] : ["Leadership", "Advanced " + (e.skills[0] || "skills")],
          feedback: `${e.name} has a performance score of ${e.performanceScore}. ${e.performanceScore >= 75 ? "Keep up the great work!" : "Focus on skill development."}`,
          overallRating: e.performanceScore >= 85 ? "Excellent" : e.performanceScore >= 65 ? "Good" : "Needs Improvement",
        })),
        note: "⚠️ AI API key not configured. Showing rule-based recommendations. Set OPENROUTER_API_KEY in .env for real AI.",
      });
    }

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;