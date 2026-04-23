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
    
    // NOTE: You will need to drop your specific OpenClaw 'runAssistant' logic here.

    res.status(200).json({
      success: true,
      result: {
        title: `Search results for: ${query}`,
        url: "https://www.zillow.com",
        snippet: "Connection successful! Drop your OpenClaw logic into the Vercel function.",
        rank: 1,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
