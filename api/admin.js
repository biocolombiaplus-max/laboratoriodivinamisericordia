/* API del panel administrativo para Vercel (función serverless).
   Mismo protocolo que api/save.php, para que el panel funcione igual en
   Vercel y en hostings con PHP:
   - GET  ?ping=1                          → { ok, platform, storage }
   - POST { action: "login",  pass }
   - POST { action: "upload", pass, name, data }       → guarda una imagen
   - POST { action: "save",   pass, content, files }   → publica el contenido
   - POST { action: "password" }                       → en Vercel la clave se cambia en
                                                         Environment Variables (ADMIN_PASSWORD)

   Dónde se publica (el primero que esté configurado):
   1. GitHub (gratis): con la variable GITHUB_TOKEN, «Publicar» hace UN commit
      en el repositorio con content.json y las imágenes nuevas en uploads/, y
      Vercel vuelve a desplegar solo (~1 minuto). El repositorio y la rama
      salen de las variables de sistema de Vercel (o de GITHUB_REPO /
      GITHUB_BRANCH si se quieren fijar).
   2. Vercel Blob: con un almacenamiento Blob público conectado.
   Opcional: ADMIN_PASSWORD (si no existe, la clave es 123456). */
const crypto = require('crypto');

const DEFAULT_PASS = '123456';
const MAX_IMAGE = 3.5 * 1024 * 1024; // límite de cuerpo de Vercel: 4.5 MB
const IMG_RE = /^data:image\/(png|jpe?g|webp|gif);base64,/;

function send(res, code, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(code).send(JSON.stringify(data));
}

function samePass(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function storage() {
  if (process.env.GITHUB_TOKEN) return 'github';
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return 'blob';
  return '';
}

function parseImage(data) {
  const m = IMG_RE.exec(String(data || ''));
  if (!m) return null;
  const buf = Buffer.from(String(data).slice(m[0].length), 'base64');
  if (!buf.length || buf.length > MAX_IMAGE) return null;
  return { buf, ext: m[1] === 'jpeg' ? 'jpg' : m[1] };
}

/* ---------- GitHub (API de Git: un solo commit por publicación) ---------- */
function repo() {
  const full = process.env.GITHUB_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG
      : 'biocolombiaplus-max/laboratoriodivinamisericordia');
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';
  return { full, branch };
}

async function gh(method, path, body) {
  const r = await fetch('https://api.github.com/repos/' + repo().full + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'panel-divina-misericordia',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error('GitHub ' + r.status + ': ' + (data.message || ''));
    e.status = r.status;
    throw e;
  }
  return data;
}

async function ghBlob(buf) {
  const d = await gh('POST', '/git/blobs', { content: buf.toString('base64'), encoding: 'base64' });
  return d.sha;
}

async function ghCommit(entries, message) {
  const branch = repo().branch;
  const ref = await gh('GET', '/git/ref/heads/' + branch.split('/').map(encodeURIComponent).join('/'));
  const parent = await gh('GET', '/git/commits/' + ref.object.sha);
  const tree = await gh('POST', '/git/trees', { base_tree: parent.tree.sha, tree: entries });
  if (tree.sha === parent.tree.sha) return parent.sha; // sin cambios
  const commit = await gh('POST', '/git/commits', { message, tree: tree.sha, parents: [ref.object.sha] });
  await gh('PATCH', '/git/refs/heads/' + branch.split('/').map(encodeURIComponent).join('/'), { sha: commit.sha });
  return commit.sha;
}

function ghError(err) {
  if (err.status === 401) return 'El GITHUB_TOKEN de Vercel no es válido o expiró. Cree uno nuevo y actualice la variable.';
  if (err.status === 403 || err.status === 404) return 'El GITHUB_TOKEN no tiene permiso de escritura (Contents: Read and write) sobre el repositorio ' + repo().full + '.';
  if (err.status === 409 || err.status === 422) return 'GitHub rechazó el cambio porque el repositorio se actualizó al mismo tiempo. Pulse «Publicar» de nuevo.';
  return null;
}

module.exports = async function handler(req, res) {
  const store = storage();

  if (req.method === 'GET') {
    return send(res, 200, { ok: !!store, platform: 'vercel', storage: store, blob: store === 'blob' });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, message: 'Método no permitido' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return send(res, 400, { ok: false, message: 'Solicitud no válida' });

  if (!samePass(body.pass || '', process.env.ADMIN_PASSWORD || DEFAULT_PASS)) {
    await new Promise((r) => setTimeout(r, 800)); // frena intentos por fuerza bruta
    return send(res, 401, { ok: false, message: 'Clave incorrecta' });
  }

  try {
    switch (body.action) {
      case 'login':
        return send(res, 200, { ok: true });

      case 'upload': {
        if (!store) return send(res, 503, { ok: false, message: 'Falta configurar la publicación en Vercel (GITHUB_TOKEN).' });
        const img = parseImage(body.data);
        if (!img) return send(res, 400, { ok: false, message: 'Imagen no válida o muy grande' });
        if (store === 'github') {
          // El nombre es el hash del contenido: la misma imagen nunca se duplica.
          const hash = crypto.createHash('sha256').update(img.buf).digest('hex').slice(0, 20);
          const path = 'uploads/' + hash + '.' + img.ext;
          const sha = await ghBlob(img.buf);
          return send(res, 200, { ok: true, url: path, file: { path, sha } });
        }
        const { put } = require('@vercel/blob');
        const blob = await put('uploads/imagen.' + img.ext, img.buf, { access: 'public', contentType: 'image/' + (img.ext === 'jpg' ? 'jpeg' : img.ext), addRandomSuffix: true });
        return send(res, 200, { ok: true, url: blob.url });
      }

      case 'save': {
        if (!store) return send(res, 503, { ok: false, message: 'Falta configurar la publicación en Vercel (GITHUB_TOKEN).' });
        const c = body.content;
        if (!c || typeof c !== 'object' || !c.sections || !c.brand) return send(res, 400, { ok: false, message: 'Contenido no válido' });
        const json = JSON.stringify(c, null, 2);
        if (store === 'github') {
          const files = (Array.isArray(body.files) ? body.files : []).filter((f) =>
            f && /^uploads\/[a-f0-9]{8,64}\.(png|jpg|webp|gif)$/.test(f.path) && /^[a-f0-9]{40}$/.test(f.sha));
          const entries = files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', sha: f.sha }));
          entries.push({ path: 'content.json', mode: '100644', type: 'blob', sha: await ghBlob(Buffer.from(json)) });
          await ghCommit(entries, 'Contenido publicado desde el panel administrativo');
          return send(res, 200, { ok: true, deploy: true });
        }
        const { put } = require('@vercel/blob');
        await put('site/content.json', json, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
        await put('site/backups/content-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json', json,
          { access: 'public', contentType: 'application/json', addRandomSuffix: true }).catch(() => null);
        return send(res, 200, { ok: true });
      }

      case 'password':
        return send(res, 200, { ok: false, message: 'En Vercel la clave se cambia en Settings → Environment Variables → ADMIN_PASSWORD, y luego Redeploy.' });

      default:
        return send(res, 400, { ok: false, message: 'Acción desconocida' });
    }
  } catch (err) {
    console.error('admin api', err);
    const msg = (err.status && ghError(err)) ||
      (/access/i.test(String(err && (err.name + ' ' + err.message)))
        ? 'El almacenamiento Blob debe ser de acceso público (créelo como «Public» en Vercel → Storage).'
        : 'Error del servidor al guardar. Intente de nuevo.');
    return send(res, 500, { ok: false, message: msg });
  }
};
