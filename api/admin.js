/* API del panel administrativo para Vercel (función serverless + Vercel Blob).
   Mismo protocolo que api/save.php, para que el panel funcione igual en
   Vercel y en hostings con PHP:
   - GET  ?ping=1                          → { ok, platform, blob }
   - POST { action: "login",  pass }
   - POST { action: "save",   pass, content }          → guarda el contenido publicado
   - POST { action: "upload", pass, name, data }       → guarda una imagen, devuelve { url }
   - POST { action: "password" }                       → en Vercel la clave se cambia en
                                                         Environment Variables (ADMIN_PASSWORD)
   Requiere en el proyecto de Vercel:
   - Un almacenamiento Blob público conectado (crea BLOB_READ_WRITE_TOKEN o BLOB_STORE_ID).
   - Opcional: ADMIN_PASSWORD (si no existe, la clave es 123456). */
const crypto = require('crypto');
const { put } = require('@vercel/blob');

const DEFAULT_PASS = '123456';
const CONTENT_PATH = 'site/content.json';
const MAX_IMAGE = 3.5 * 1024 * 1024; // límite de cuerpo de Vercel: 4.5 MB

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

module.exports = async function handler(req, res) {
  const hasBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

  if (req.method === 'GET') {
    return send(res, 200, { ok: hasBlob, platform: 'vercel', blob: hasBlob });
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

      case 'save': {
        if (!hasBlob) return send(res, 503, { ok: false, message: 'Falta conectar el almacenamiento Blob en Vercel.' });
        const c = body.content;
        if (!c || typeof c !== 'object' || !c.sections || !c.brand) return send(res, 400, { ok: false, message: 'Contenido no válido' });
        const json = JSON.stringify(c);
        await put(CONTENT_PATH, json, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
        // respaldo de cada publicación (nombre único)
        await put('site/backups/content-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json', json,
          { access: 'public', contentType: 'application/json', addRandomSuffix: true }).catch(() => null);
        return send(res, 200, { ok: true });
      }

      case 'upload': {
        if (!hasBlob) return send(res, 503, { ok: false, message: 'Falta conectar el almacenamiento Blob en Vercel.' });
        const m = /^data:image\/(png|jpe?g|webp|gif);base64,/.exec(String(body.data || ''));
        if (!m) return send(res, 400, { ok: false, message: 'Formato no permitido' });
        const buf = Buffer.from(String(body.data).slice(m[0].length), 'base64');
        if (!buf.length || buf.length > MAX_IMAGE) return send(res, 400, { ok: false, message: 'Imagen no válida o muy grande' });
        const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
        const blob = await put('uploads/imagen.' + ext, buf, { access: 'public', contentType: 'image/' + (ext === 'jpg' ? 'jpeg' : ext), addRandomSuffix: true });
        return send(res, 200, { ok: true, url: blob.url });
      }

      case 'password':
        return send(res, 200, { ok: false, message: 'En Vercel la clave se cambia en Settings → Environment Variables → ADMIN_PASSWORD, y luego Redeploy.' });

      default:
        return send(res, 400, { ok: false, message: 'Acción desconocida' });
    }
  } catch (err) {
    console.error('admin api', err);
    const msg = /access/i.test(String(err && (err.name + ' ' + err.message)))
      ? 'El almacenamiento Blob debe ser de acceso público (créelo como «Public» en Vercel → Storage).'
      : 'Error del servidor al guardar. Intente de nuevo.';
    return send(res, 500, { ok: false, message: msg });
  }
};
