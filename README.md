# Laboratorio Clínico Divina Misericordia — Sitio web

Landing page premium con portal de resultados para pacientes y panel administrativo oculto.
HTML, CSS y JavaScript puros: no hay que compilar nada. El PHP es opcional y sirve para publicar con un clic.

## Secciones

Portada (hero) · Cifras · **Portal de resultados** · Servicios · Nosotros (misión y visión) · Por qué elegirnos ·
Cómo funciona · Chequeos y precios · Toma a domicilio · Equipo · Convenios · Testimonios ·
Preparación de exámenes · Preguntas frecuentes · **Cómo llegar (Google Maps + Waze)** · Contacto por WhatsApp.

Todas las secciones se pueden editar, ocultar y reordenar desde el panel.

## Panel administrativo

Formas de abrirlo:

1. Botón **«Iniciar sesión»** al final del pie de página, junto a «Ley 1581 de 2012».
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

## Portal de resultados (conectado a BIOsoft)

El sitio viene en modo **BIOsoft**: se conecta directamente a la base de datos del software (Firestore `biosoft-produccion`).
No requiere servidor propio ni claves secretas.

Cómo funciona:

1. En BIOsoft, el laboratorio envía el resultado desde **Reportes → Enviar resultados**.
   BIOsoft lo publica en `resultadosPublicos/{código}`.
2. El paciente entra a la web, escribe su **número de documento** y el **código de consulta de 6 dígitos** de su comprobante,
   y acepta el tratamiento de datos (Ley 1581).
3. La web lee **solo ese código** (nunca un listado) y verifica que el documento coincida.
   Si el código o el documento no corresponden, muestra el mismo mensaje en ambos casos, para no revelar cuál falló.
4. El paciente ve su nombre, el número de orden y la fecha. En computador el PDF se muestra en pantalla.
   Puede descargarlo o abrirlo en otra pestaña, y descargar también **sus resultados anteriores** (historial).

En **Panel → Resultados**:

- **ID del laboratorio en BIOsoft** (opcional, recomendado): es el valor `t=` del enlace de la Página Web en
  BIOsoft (Configuración → Página Web). Con él, la web solo muestra resultados de Divina Misericordia.
- **Importar marca y contenido desde BIOsoft**: trae lo que el laboratorio ya configuró en BIOsoft y solo reemplaza lo que tenga dato:
  - logo, color, teléfono/WhatsApp, correo, dirección y redes sociales;
  - textos de portada y nosotros, y sus fotos;
  - servicios, testimonios y cifras;
  - horario y ubicación del mapa.

  Si la web está en el dominio registrado en BIOsoft, encuentra el laboratorio sola.

Hay otros modos disponibles para laboratorios que no usan BIOsoft:

- **Demostración**: muestra un resultado de ejemplo.
- **Enlace de otro software**: arma la URL con `{cedula}`, `{codigo}` y `{tipo}`.
- **API JSON**: hace `POST {tipo, cedula, codigo}` y espera `{ok, pdfUrl | pdfBase64 | html, message}`.

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
- En Panel → Resultados, escriba el ID del laboratorio en BIOsoft y pulse «Importar marca y contenido desde BIOsoft».
- Haga una consulta real con el documento y el código de un paciente cuyo resultado ya se haya enviado desde BIOsoft.
