require('dotenv').config();

(async () => {
  try {
    const base = (process.env.AI_API_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    const url = `${base}/models`;
    console.log('[list_models] GET', url);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` } });
    console.log('[list_models] status:', res.status);
    const body = await res.text();
    console.log('[list_models] body:', body.slice(0, 2000));
  } catch (err) {
    console.error('[list_models] error:', err.message);
    process.exit(1);
  }
})();
