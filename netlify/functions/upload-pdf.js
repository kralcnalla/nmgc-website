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
  catch (e) { return respond(400, { error: 'Invalid request body' }); }

  const filename = body.filename;
  const content  = body.content;
  const password = body.password;

  const expectedPassword = process.env.UPLOAD_PASSWORD;
  if (expectedPassword && password !== expectedPassword) {
    return respond(403, { error: 'Unauthorized' });
  }

  if (!filename || !content) {
    return respond(400, { error: 'Missing filename or content' });
  }

  // Prevent path traversal — letters, numbers, hyphens, underscores, dots only
  if (!/^[a-zA-Z0-9_.][a-zA-Z0-9_.-]*$/.test(filename)) {
    return respond(400, { error: 'Invalid filename' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return respond(500, { error: 'GITHUB_TOKEN not configured on server' });
  }

  const filePath = 'pdfs/' + filename;

  try {
    const sha = await getFileSha(token, filePath);
    await commitFile(token, filePath, content, sha, 'Upload ' + filename + ' via admin wizard');
    return respond(200, { url: 'https://nemadjimensclub.com/pdfs/' + filename });
  } catch (err) {
    return respond(500, { error: err.message || 'Upload failed' });
  }
};

// ── GitHub API helpers ──────────────────────────────────────

function githubRequest(token, method, apiPath, data) {
  return new Promise(function(resolve, reject) {
    var bodyStr = data ? JSON.stringify(data) : null;
    var options = {
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'nmgc-upload-function',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    if (bodyStr) {
      options.headers['Content-Type']   = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    var req = https.request(options, function(res) {
      var raw = '';
      res.on('data', function(chunk) { raw += chunk; });
      res.on('end', function() {
        var parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function getFileSha(token, filePath) {
  return githubRequest(token, 'GET', '/repos/' + OWNER + '/' + REPO + '/contents/' + filePath + '?ref=' + BRANCH)
    .then(function(res) {
      return res.status === 200 ? res.body.sha : null;
    });
}

function commitFile(token, filePath, content, sha, message) {
  var data = { message: message, content: content, branch: BRANCH };
  if (sha) data.sha = sha;
  return githubRequest(token, 'PUT', '/repos/' + OWNER + '/' + REPO + '/contents/' + filePath, data)
    .then(function(res) {
      if (res.status !== 200 && res.status !== 201) {
        var msg = (res.body && res.body.message) ? res.body.message : 'GitHub API error ' + res.status;
        throw new Error(msg);
      }
    });
}

function respond(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
