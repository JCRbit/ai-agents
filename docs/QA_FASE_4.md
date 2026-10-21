# Fase 4 — Informe de validación

## Comprobaciones realizadas

- [x] Pruebas de comportamiento de los módulos 1, 2, 3 y 4 ejecutadas con Node.js: todas pasan.
- [x] Revisión de referencias locales `href` y `src` en las seis páginas HTML: no se encontraron referencias locales rotas.
- [x] Servidor local estático iniciado para preparar la revisión visual.

## Limitación pendiente

- [ ] La captura visual/responsive automatizada con Playwright no pudo ejecutarse porque el entorno no tiene instalado el paquete `playwright` en la ruta que espera `qa/capture.js` (`/home/claude/.npm-global/lib/node_modules/playwright`). Por tanto, no se afirma que la revisión visual en Chromium esté completada.

## Cómo completar la comprobación visual

Instala Playwright y Chromium en el entorno de desarrollo y sigue los pasos del apartado «Control de calidad» del `README.md`. Después, abre las páginas en móvil, tablet y escritorio y revisa especialmente el menú, los títulos largos, las demos interactivas y el caso práctico transversal.

## Resultado

Las pruebas de lógica y las referencias locales están verificadas. La validación visual en navegador queda pendiente por falta de la dependencia de Playwright; no se han realizado cambios funcionales durante esta fase de QA.
