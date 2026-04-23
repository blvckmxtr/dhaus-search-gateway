import { client } from 'openclaw-client';

async function runAssistant(action, payload) {
  const task = `Perform an internet search for the following query: ${action}. Query: ${JSON.stringify(payload)}`;
  const { sessionId } = await client.sessions.spawn({
    task,
    runtime: "acp",
    mode: "run",
    cleanup: "delete",
  });
  const result = await client.sessions.waitForCompletion(sessionId, { timeoutMs: 30000 });
  return result.lastMessage;
}

export const config = {
  runtime: "nodejs22",
};

export default async function handler(req, res) {
  // CORS headers for front‑end on https://dhaus-mansion.vercel.app
  res.setHeader("Access-Control-Allow-Origin", "https://dhaus-mansion.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  let query;
  try {
    const raw = req.body;
    query = raw.query;
    if (!query) throw new Error("Missing 'query' field");
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: e.message });
  }

  try {
    const reply = await runAssistant("search", { q: query });
    let result;
    try {
      result = JSON.parse(reply);
    } catch {
      result = { raw: reply };
    }
    return res.status(200).json({ success: true, result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}