# Arquitectura del sitio

Notas técnicas para quien vaya a tocar el código en `site/`. La visión general
del proyecto está en el [README](../README.md) raíz; esto es el "cómo".

## Sin build step, a propósito

Es HTML/CSS/JS estático. Se abre `site/index.html` directamente o se sirve
con cualquier servidor estático (ver README, sección "Cómo ejecutarlo en
local"). No hay bundler, no hay paso de compilación, no hay `node_modules`
en producción.

## Tokens de diseño

Todo el sistema de color, tipografía y layout vive como custom properties al
principio de `site/assets/css/styles.css` (`:root { ... }`). Antes de añadir
un color o tamaño nuevo, comprueba si ya existe un token que sirva — el
objetivo es que toda la web use la misma paleta reducida:

- **Color:** paleta de sala de control / telemetría — fondo slate casi negro,
  ámbar (`--color-accent`) como estado activo/acción, teal apagado
  (`--color-observation`) para datos y observaciones.
- **Tipografía:** IBM Plex Sans para todo el texto, IBM Plex Mono reservada
  para trazas, código y etiquetas técnicas.

## El sidebar "En esta página"

Cada página (portada + los 5 módulos) tiene un sidebar de contenidos a la
izquierda, generado enteramente por `site/assets/js/toc.js` — no hay que
mantener la lista a mano en cada HTML. El script:

1. Busca todos los `<h2 id="...">` y `<h3 id="...">` dentro de `main > .page`.
2. Envuelve el contenido existente de `.page` en un `<div class="page-content">`
   y añade el `<nav class="page-toc">` generado como hermano, marcando `.page`
   con la clase `has-toc` (es lo que activa la rejilla de 2 columnas en CSS,
   solo a partir de 1024px de ancho — por debajo, el sidebar simplemente no
   se muestra y la página se ve exactamente igual que sin esta función).
3. Resalta la sección activa mientras se hace scroll.

**Por qué el resaltado no usa `IntersectionObserver`:** la primera versión sí
lo usaba (una banda en el 20% superior del viewport), pero con encabezados
anidados (un `h2` y el `h3` justo debajo) ambos pueden estar dentro de esa
banda a la vez, y el callback que llegue último gana — lo que dejaba el `h2`
padre resaltado justo después de hacer clic en su primer `h3` hijo. La
versión actual usa el algoritmo clásico de scrollspy: en cada frame de
scroll, recorre los encabezados en orden de documento y toma el *último* que
ya haya cruzado una línea fija cerca de la parte superior del viewport. Como
un hijo aparece después que su padre en el documento, esto resuelve el
anidamiento correctamente sin casos especiales.

**Para que un enlace del sidebar no deje el encabezado tapado bajo la
cabecera fija:** todos los `h1/h2/h3` llevan `scroll-margin-top: 5rem` en
CSS — si cambias la altura de `.site-header`, actualiza ese valor a juego
(y el `top: 5rem` de `.page-toc` en la misma media query).

Si añades una sección nueva a un módulo, solo hace falta darle un `id` único
al `<h2>` o `<h3>`; el sidebar se regenera solo la próxima vez que cargue la
página. Si una página no tiene ningún `h2`/`h3` con `id`, el script no crea
ningún sidebar en absoluto (no se ejecuta la reestructuración del DOM).

## Cómo está enganchada cada página de módulo

Cada `site/modules/modulo-N.html` (N = 1 a 4) tiene dos contenedores vacíos:

```html
<div class="widget-shell" id="demo-root">...</div>
<div class="widget-shell" id="lab-root">...</div>
```

y carga su propio script al final de la página:

```html
<script src="../assets/js/modules/module-N.js"></script>
```

`module-N.js` busca esos dos contenedores en `DOMContentLoaded` y construye
la demo y el laboratorio ahí dentro. Cada archivo `module-N.js` es
autocontenido — no comparte estado con los demás ni con `main.js` (que solo
gestiona el resaltado del enlace de navegación activo). Esto significa que
hay algo de código duplicado entre módulos (por ejemplo, el "trace player"
de los Módulos 1 y 2), aceptado a cambio de que cada módulo se pueda tocar o
reescribir sin arrastrar a los demás.

El Módulo 5 es solo teoría y referencias — no tiene `module-5.js`.

## Las demos son simulaciones guionizadas, no llamadas reales

Ninguna demo llama a un LLM de verdad. Los Módulos 1 y 2 reproducen trazas
fijas escritas a mano; el Módulo 3 usa una heurística de coincidencia de
palabras clave (declarada explícitamente como tal en la propia interfaz,
para no confundirla con cómo decide un modelo real); el Módulo 4 simula el
avance de un plan con un presupuesto de iteraciones.

Esto fue una decisión deliberada: cero coste, cero dependencia de red, y
control total del ritmo pedagógico para una presentación en directo.

## Llamadas reales a una API

**Implementado** para el laboratorio del Módulo 3 (era el candidato de
mayor impacto por menor esfuerzo, y así se hizo):

- `site/assets/js/modules/module-3.js` — el laboratorio (no la demo, que se
  queda 100% simulación para funcionar sin configuración) permite introducir
  una API key personal de Groq y, si está configurada, llama directamente a
  la API de Groq con las mismas 4 tools que la simulación (`buscador_web`,
  `calculadora`, `base_de_datos_interna`, `traductor`) mediante tool calling.
  La clave y el modelo se guardan únicamente en `localStorage`.
  verdad; si la llamada falla por lo que sea, muestra un aviso y cae de
  vuelta a la simulación sin romper la página.
- Guía completa de despliegue y conexión: [`docs/API_SETUP.md`](API_SETUP.md).
- Cubierto por tests con `fetch` mockeado en `qa/test-module-3.js`: éxito,
  fallo con fallback, y persistencia del endpoint guardado.

Candidato natural para una futura ampliación: el **laboratorio del Módulo
2** (traza ReAct real para la pregunta que el usuario escriba), siguiendo
el mismo patrón (Worker + fallback a la traza guionizada). Los Módulos 1 y
4 pueden quedarse guionizados sin perder valor pedagógico: su punto es la
comparación estructural (llamadas/tokens, presupuesto de iteraciones), no
la respuesta en sí.
