import { client } from 'openclaw-client';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "https://dhaus-mansion.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query } = req.body;
    const token = process.env.OPENACLAW_TOKEN;

    if (!token) {
      return res.status(401).json({ success: false, error: "Missing OPENACLAW_TOKEN" });
    }

    // Initialize the OpenClaw client
    const claw = new client({ token });
    
    // 1. Create a fresh, one-shot session
    const session = await claw.sessions.create();

    // 2. Run the assistant with the web_search skill
    const assistantResult = await claw.runAssistant({
      sessionId: session.id,
      task: `Use your web_search skill to find real estate information for: "${query}". Format your final answer exactly as a JSON object with these keys: title, url, snippet, rank, timestamp. Do not include markdown formatting or extra text.`,
      skills: ['web_search']
    });

    // 3. Delete the session to prevent lingering state
    await claw.sessions.delete(session.id);

    // Parse the JSON string returned by the assistant
    const resultData = JSON.parse(assistantResult.lastMessage);

    // Return the live data to your frontend
    res.status(200).json({
      success: true,
      result: resultData
    });

  } catch (error) {
    console.error("OpenClaw Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
