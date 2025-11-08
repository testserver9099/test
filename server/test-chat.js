const axios = require('axios');

(async () => {
  const messages = [{ role: 'user', content: 'Hello from automated test' }];
  const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

  const apiKey = process.env.GOOGLE_API_KEY;
  const project = process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_LOCATION || 'us-central1';
  const model = process.env.GOOGLE_MODEL || 'models/chat-bison@001';

  if (!apiKey || !project) {
    console.log(JSON.stringify({ reply: `Hi — this is a demo reply. Set GOOGLE_API_KEY and GOOGLE_PROJECT_ID to enable Gemini/Vertex AI.` }, null, 2));
    process.exit(0);
  }

  const genUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateText?key=${encodeURIComponent(apiKey)}`;
  const body = {
    prompt: { text: prompt },
    temperature: 0.2,
    maxOutputTokens: 512
  };

  try {
    const response = await axios.post(genUrl, body, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });
    const reply = response.data?.candidates?.[0]?.content || response.data?.output?.[0]?.content || response.data?.content || JSON.stringify(response.data);
    console.log(JSON.stringify({ reply }, null, 2));
  } catch (err) {
    console.error('Error calling Generative API:', err?.message || err);
    process.exit(1);
  }
})();
