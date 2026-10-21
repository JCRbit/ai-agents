# Introducción a Agentes de IA

**Bucles de decisión autónomos y razonamiento independiente**

> Un LLM es una función. Un agente es un bucle.

Proyecto educativo interactivo, sin build step, que explica cómo un modelo de lenguaje deja de limitarse a responder y empieza a decidir: razonamiento explícito (ReAct), uso de herramientas, memoria y el criterio que le dice cuándo parar. Cada módulo sigue el mismo patrón: **teoría desde cero → demo visual → laboratorio guiado**.

El sitio es bilingüe: el botón **English / Español** del encabezado cambia el contenido visible y recuerda la preferencia en el navegador.

## Demo en vivo

La aplicación está desplegada y disponible públicamente mediante Cloudflare Workers.

**URL:** [https://ai-agents.metamask-one.workers.dev/](https://ai-agents.metamask-one.workers.dev/)

El sitio es estático y no requiere un paso de compilación para ejecutarse.

## Contenido del tutorial

| # | Módulo | Demo | Laboratorio |
|---|--------|------|--------------|
| 01 | Fundamentos: de completar texto a tomar decisiones | Una llamada vs un bucle, con contador de llamadas y tokens en vivo | Modo "sin herramientas" vs "modo agente" sobre la misma pregunta |
| 02 | El bucle ReAct: razonar y actuar | Traza Thought/Action/Observation paso a paso | Misma pregunta con 3 formulaciones: el número de pasos cambia según cuánta información ya se da |
| 03 | Herramientas: cómo decide el modelo | Selector de herramientas por puntuación sobre texto libre | Reto: corregir una pregunta ambigua que dispara la herramienta equivocada |
| 04 | Memoria, planificación y criterio de parada | Árbol de subtareas con presupuesto de iteraciones deliberadamente corto | El usuario fija el límite de iteraciones (2-8) antes de ejecutar |
| 05 | Panorama de industria | — (solo teoría y referencias) | — |

El guion detallado de cada módulo (teoría completa, texto de las demos y enunciados de los laboratorios) está en [`docs/guion-agentes-ia.md`](docs/guion-agentes-ia.md).

## Estructura del repositorio

```text
.
├── .github/                       Configuración de GitHub (si se usan workflows)
├── docs/
│   ├── guion-agentes-ia.md        Guion completo de contenidos, por módulo
│   ├── ARCHITECTURE.md            Notas técnicas para quien toque el código
│   ├── API_SETUP.md               Cómo configurar el Worker y conectarlo al lab
│   └── screenshots/               Capturas usadas en este README
├── labs/
│   ├── pizza_agent_lab.ipynb      Notebook de práctica
│   └── solutions/
│       └── pizza_agent_lab_solved.ipynb
├── site/                          Sitio estático que se publica
│   ├── index.html                 Portada: hero + ruta de aprendizaje
│   ├── modules/
│   │   └── modulo-1.html … modulo-5.html
│   └── assets/
│       ├── css/styles.css         Hoja de estilos global
│       └── js/                    Comportamiento compartido y demos
├── .editorconfig
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

Los notebooks se mantienen en el repositorio como materiales de aprendizaje, separados de la web que se publica. La carpeta `labs/solutions/` organiza las soluciones, pero **no las hace privadas**: si el repositorio es público, cualquier persona podrá acceder a ellas.

## Cómo ejecutar la web en local

No hay paso de compilación.

**Con Node.js:**

```bash
npm install
npm start
```

**Alternativa con Python:**

```bash
python -m http.server 8000 --directory site
```

Luego abre `http://localhost:8000`.

También puedes abrir `site/index.html` directamente con doble clic, aunque para probar llamadas a APIs es preferible usar un servidor local: los navegadores restringen algunas peticiones hechas desde `file://`.

## Cómo ejecutar los notebooks

Puedes abrir los archivos `.ipynb` con Jupyter o subirlos a Google Colab para ejecutarlos desde el navegador.

- Notebook de práctica: [`labs/pizza_agent_lab.ipynb`](labs/pizza_agent_lab.ipynb)
- Notebook resuelto: [`labs/solutions/pizza_agent_lab_solved.ipynb`](labs/solutions/pizza_agent_lab_solved.ipynb)

Las dependencias de Python dependerán de las bibliotecas importadas por cada notebook. Si el proyecto requiere instalar paquetes, documenta las dependencias en un `requirements.txt` dentro de `labs/` o en la carpeta que corresponda.

## Sistema de diseño (resumen)

- **Color:** paleta de sala de control / telemetría — fondo slate casi negro, ámbar como estado activo, teal apagado para datos/observaciones.
- **Tipografía:** IBM Plex Sans (texto) + IBM Plex Mono (código, trazas, etiquetas técnicas).
- **Contenido visible bilingüe:** español por defecto, con cambio a inglés desde el botón del encabezado. La traducción se realiza en el navegador, sin servicios externos ni API key.
- **Código y comentarios** en inglés; documentación principal en español.

Detalle completo en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Control de calidad

El código en `qa/` contiene pruebas de comportamiento y comprobaciones visuales:

- **`test-module-1.js` … `test-module-4.js`** — ejercitan las demos y laboratorios de los módulos con un DOM simulado.
- **`capture.js` / `find-overflow*.js`** — usan Chromium mediante Playwright para detectar desbordamiento horizontal en móvil, tablet y escritorio y registrar errores de consola. Requieren un navegador de Playwright instalado y el sitio servido en `localhost:8000`.

```bash
# Tests de comportamiento
node qa/test-module-1.js && node qa/test-module-2.js \
  && node qa/test-module-3.js && node qa/test-module-4.js

# QA visual/responsive (requiere Playwright y el sitio servido)
npm start

# En otra terminal:
node qa/capture.js
```

## Estado del proyecto

- [x] Esqueleto completo: portada, 5 módulos y navegación
- [x] Demo + laboratorio del Módulo 1 (una llamada vs un bucle)
- [x] Demo + laboratorio del Módulo 2 (traza ReAct)
- [x] Demo + laboratorio del Módulo 3 (selector de herramientas)
- [x] Demo + laboratorio del Módulo 4 (árbol de planificación)
- [x] Referencias finales del Módulo 5
- [x] Llamadas reales a una API — el laboratorio del Módulo 3 puede usar Groq mediante API key personal (opt-in, ver [`docs/API_SETUP.md`](docs/API_SETUP.md))
- [x] Interfaz bilingüe ES/EN con selector persistente en el navegador
- [x] Desplegar la web y documentar la URL pública en Cloudflare Workers


