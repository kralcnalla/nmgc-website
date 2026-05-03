const https = require('https');

const OWNER  = 'kralcnalla';
const REPO   = 'nmgc-website';
const BRANCH = 'main';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return respond(400, { error: 'Invalid request body' }); }

  const { filename, content, password } = body;

  const expectedPassword = process.env.UPLOAD_PASSWORD;
  if (expectedPassword && password !== expectedPassword) {
    return respond(403, { error: 'Unauthorized' });
  }

  if (!filename || !content) {
    return respond(400, { error: 'Missing filename or content' });
  }

  // Prevent path traversal — letters, numbers, hyphens, underscores, dots only
  if (!/^[a-zA-Z0-9_\-.]+$/.test(filename) || filename.startsWith('.')) {
    return respond(400, { error: 'Invalid filename' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return respond(500, { error: 'GITHUB_TOKEN not configured on server' });
  }

  const path = `pdfs/${filename}`;

  try {
    const sha = await getFileSha(token, path);
    await commitFile(token, path, content, sha, `Upload ${filename} via admin wizard`);
    return respond(200, { url: `https://nemadjimensclub.com/pdfs/${filename}` });
  } catch (err) {
    return respond(500, { error: err.message || 'Upload failed' });
  }
};

// ── GitHub API helpers ──────────────────────────────────────

function githubRequest(token, method, apiPath, data) {
  return new Promise((resolve, reject) => {
    const bodyStr = data ? JSON.stringify(data) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: apiPath,
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'nmgc-upload-function',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(bodyStr ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr)
          } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
          catch { resolve({ status: res.statusCode, body: null }); }
        });
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function getFileSha(token, path) {
  const res = await githubRequest(
    token, 'GET',
    `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`
  );
  return res.status === 200 ? res.body.sha : null;
}

async function commitFile(token, path, content, sha, message) {
  const data = { message, content, branch: BRANCH };
  if (sha) data.sha = sha;
  const res = await githubRequest(
    token, 'PUT',
    `/repos/${OWNER}/${REPO}/contents/${path}`,
    data
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error((res.body && res.body.message) || `GitHub API error ${res.status}`);
  }
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
