/* Entrega el contenido publicado desde el panel (guardado en Vercel Blob).
   La CDN de Vercel lo guarda en caché 2 minutos para no consumir operaciones
   de Blob en cada visita; si aún no se ha publicado nada responde 404 y la
   página usa content.json o el contenido de ejemplo. */
const { head } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(404).send('{}');
  }
  try {
    const meta = await head('site/content.json');
    const r = await fetch(meta.url + '?v=' + new Date(meta.uploadedAt).getTime(), { cache: 'no-store' });
    if (!r.ok) throw new Error('blob ' + r.status);
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=86400');
    return res.status(200).send(await r.text());
  } catch (err) {
    // BlobNotFoundError: todavía no se ha publicado
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(404).send('{}');
  }
};
