# Laboratorio Clínico Divina Misericordia — Sitio web

Landing page premium con portal de resultados para pacientes y panel administrativo oculto.
HTML, CSS y JavaScript puros: no hay que compilar nada. El PHP es opcional y sirve para publicar con un clic.

## Secciones

Portada (hero) · Cifras · **Portal de resultados** · Servicios · Nosotros (misión y visión) · Por qué elegirnos ·
Cómo funciona · Chequeos y precios · Toma a domicilio · Equipo · Convenios · Testimonios ·
Preparación de exámenes · Preguntas frecuentes · **Cómo llegar (Google Maps + Waze)** · Contacto por WhatsApp.

Todas las secciones se pueden editar, ocultar y reordenar desde el panel.

## Panel administrativo (acceso oculto)

Hay tres formas de abrirlo:

1. Hacer clic en el punto discreto **•** al final del pie de página, junto a «Ley 1581 de 2012».
2. Pulsar **Ctrl + Shift + A**.
3. Abrir la dirección del sitio terminada en **`#admin`** (por ejemplo, `midominio.com/#admin`).

La **clave inicial es `123456`**. Cámbiela desde la pestaña **Publicar** el mismo día que entregue el sitio.

Pestañas del panel:

| Pestaña | Qué se edita |
|---|---|
| Secciones | Textos, imágenes y elementos de cada sección (agregar, quitar, reordenar). Cada imagen se puede mostrar **en un recuadro elegante** o **de fondo**, y el oscurecimiento del fondo es ajustable. |
| Marca y logo | Nombre, logo, **tamaño del logo** en el menú y en la portada, **posición** (arriba del título, debajo de los botones o grande a la derecha), **alineación**, fondo blanco tras el logo, colores de marca, teléfono, WhatsApp, correo, dirección y redes. |
| Resultados | Conexión con el software del laboratorio. |
| Orden | Orden de las secciones y cuáles se muestran. |
| Publicar | Publicar, exportar o importar el contenido, cambiar la clave y restaurar. |

Con la sesión iniciada, cada sección de la página muestra un botón **«✎ Editar»** que abre directamente su formulario.

## Portal de resultados

El paciente ingresa el tipo de documento, el número y el código de consulta, y autoriza el tratamiento de datos (Ley 1581).
En **Panel → Resultados** se elige el modo:

- **Demostración**: muestra un resultado de ejemplo. Viene activado para enseñar el sitio al cliente.
- **Enlace del software**: arma la URL del software reemplazando `{cedula}`, `{codigo}` y `{tipo}`.
  Por ejemplo: `https://software.com/resultados?doc={cedula}&clave={codigo}`.
  El resultado se abre dentro de la página o en una pestaña nueva.
- **API JSON**: hace un `POST {tipo, cedula, codigo}` y espera una de estas respuestas:
  - `{ "ok": true, "pdfUrl": "https://…/resultado.pdf", "paciente": "Nombre" }`
  - `{ "ok": true, "pdfBase64": "…" }`
  - `{ "ok": true, "html": "<table>…</table>" }`
  - `{ "ok": false, "message": "No encontramos resultados" }`

  Si la API está en otro dominio, debe permitir CORS para el dominio del sitio.

Después de 6 consultas fallidas, el formulario se bloquea unos minutos en ese navegador.

## Dónde publicarlo

### Opción A: hosting con PHP (cPanel, Hostinger, etc.). Recomendada.

1. Suba todos los archivos a `public_html`.
2. Dé permiso de escritura a la raíz del sitio, a `uploads/` y a `api/data/`.
3. Listo. El panel muestra «Servidor conectado»:
   - **Publicar cambios** actualiza el sitio para todos los visitantes.
   - Las imágenes se guardan en `uploads/`.
   - Cada publicación deja un respaldo en `api/data/` (se conservan los últimos 15).
   - Al cambiar la clave, se guarda cifrada en el servidor.
   - Después de 10 claves incorrectas, el acceso se bloquea 15 minutos.

### Opción B: hosting estático (GitHub Pages, Netlify, Vercel)

El panel funciona en «Modo navegador»: los cambios se guardan solo en ese navegador.
Para publicarlos, use **Publicar → Descargar content.json** y suba ese archivo a la raíz del sitio.

## Estructura

```
index.html                 página
assets/css/styles.css      diseño del sitio
assets/css/admin.css       diseño del panel
assets/js/content.default.js  contenido de ejemplo (textos iniciales)
assets/js/app.js           renderizado, resultados, mapa, interacciones
assets/js/admin.js         panel administrativo
assets/js/icons.js         iconos SVG
api/save.php               API opcional para publicar y subir imágenes
content.json               (se crea al publicar) contenido real del cliente
```

## Recomendaciones antes de entregar

- Cambie la clave `123456`.
- Reemplace las fotos de ejemplo por fotos reales del laboratorio y del equipo.
- Configure el WhatsApp, la dirección y el enlace de Google Maps (Compartir → Insertar un mapa → copiar HTML).
- Configure la conexión de resultados con el software del laboratorio y pase el modo de «Demostración» a «Enlace» o «API».
