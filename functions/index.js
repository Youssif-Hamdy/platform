const functions = require('firebase-functions');
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

// Target backend base URL (Vercel)
const TARGET_BASE = 'https://educational-platform-git-main-youssefs-projects-e2c35ebf.vercel.app';

// Allow Firebase Hosting origins; for now, reflect the request origin if present
function buildCorsHeaders(req) {
  const origin = req.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': req.get('access-control-request-headers') || 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}

exports.api = functions.https.onRequest(async (req, res) => {
  const corsHeaders = buildCorsHeaders(req);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders).status(204).send('');
    return;
  }

  try {
    // Map /api/... to backend path ...
    const backendPath = req.originalUrl.replace(/^\/api/, '');
    const url = new URL(backendPath, TARGET_BASE);

    // Reconstruct fetch options
    const headers = { ...req.headers };
    // Remove forbidden hop-by-hop headers
    delete headers['host'];
    delete headers['content-length'];
    delete headers['connection'];
    delete headers['accept-encoding'];

    const init = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.rawBody,
    };

    const upstream = await fetch(url, init);
    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Copy upstream headers except problematic ones
    upstream.headers.forEach((value, key) => {
      if (['content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    res.set(corsHeaders);
    res.status(upstream.status).send(buffer);
  } catch (err) {
    res.set(corsHeaders);
    res.status(502).json({ error: 'Bad Gateway', message: String(err && err.message || err) });
  }
});








