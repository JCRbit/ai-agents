// Demo + lab logic for Module 2 — the ReAct loop.
//
// Both the demo and the lab render a "trace player": a Thought / Action /
// Observation / Final Answer log that reveals itself one step at a time,
// driven by "next step" / "auto play" / "reset" controls.
//
// Traces are scripted (not live API calls) on purpose — see README.md,
// "Next steps": Modules 1-2 use scripted traces for a fully controlled,
// zero-cost demo; the guided labs in Modules 3-4 are the candidates for
// real API calls.

document.addEventListener('DOMContentLoaded', () => {
  const demoRoot = document.querySelector('#demo-root');
  const labRoot = document.querySelector('#lab-root');

  if (demoRoot) buildDemo(demoRoot);
  if (labRoot) buildLab(labRoot);
});

// ---------------------------------------------------------------------------
// Trace data
// ---------------------------------------------------------------------------

const DEMO_QUESTION =
  '¿Cuántos días faltan desde hoy (21 de octubre de 2026) hasta el 25 de diciembre de 2026?';

const DEMO_TRACE = [
  { type: 'thought', label: 'Thought', text: 'Necesito conocer la fecha de hoy y la fecha objetivo para calcular la diferencia.' },
  { type: 'action', label: 'Action', text: 'buscar_fecha_actual()' },
  { type: 'observation', label: 'Observation', text: 'Hoy es 21 de octubre de 2026.' },
  { type: 'thought', label: 'Thought', text: 'Ya tengo ambas fechas. Puedo calcular la diferencia en días.' },
  { type: 'action', label: 'Action', text: 'calculadora("25 de diciembre de 2026 − 21 de octubre de 2026")' },
  { type: 'observation', label: 'Observation', text: '65 días.' },
  { type: 'thought', label: 'Thought', text: 'Ya tengo todo lo necesario para responder.' },
  { type: 'final', label: 'Final Answer', text: 'Faltan 65 días para el 25 de diciembre de 2026.' },
];

// Three phrasings of (roughly) the same question. The point of the lab is
// to show that the number of steps the agent takes is not fixed — it
// depends on how much the question already tells it, which the model
// decides dynamically rather than following a fixed script.
const LAB_VARIANTS = [
  {
    id: 'implicit-year',
    question: '¿Cuántos días faltan hasta el 25 de diciembre?',
    trace: [
      { type: 'thought', label: 'Thought', text: 'El usuario no ha indicado la fecha de hoy. Necesito consultarla antes de nada.' },
      { type: 'action', label: 'Action', text: 'buscar_fecha_actual()' },
      { type: 'observation', label: 'Observation', text: 'Hoy es 21 de octubre de 2026.' },
      { type: 'thought', label: 'Thought', text: 'Tampoco se ha indicado el año del 15 de diciembre; asumiré el año en tutorial, 2026.' },
      { type: 'action', label: 'Action', text: 'calculadora("25 de diciembre de 2026 − 21 de octubre de 2026")' },
      { type: 'observation', label: 'Observation', text: '65 días.' },
      { type: 'thought', label: 'Thought', text: 'Con ambos datos puedo responder.' },
      { type: 'final', label: 'Final Answer', text: 'Faltan 65 días para el 15 de diciembre (asumiendo 2026).' },
    ],
  },
  {
    id: 'explicit-target-year',
    question: '¿Cuántos días faltan desde hoy hasta el 25 de diciembre de 2026?',
    trace: [
      { type: 'thought', label: 'Thought', text: 'Necesito la fecha de hoy; el año del objetivo ya está indicado.' },
      { type: 'action', label: 'Action', text: 'buscar_fecha_actual()' },
      { type: 'observation', label: 'Observation', text: 'Hoy es 21 de octubre de 2026.' },
      { type: 'thought', label: 'Thought', text: 'Ya tengo ambas fechas completas.' },
      { type: 'action', label: 'Action', text: 'calculadora("25 de diciembre de 2026 − 21 de octubre de 2026")' },
      { type: 'observation', label: 'Observation', text: '65 días.' },
      { type: 'thought', label: 'Thought', text: 'Todo listo para responder.' },
      { type: 'final', label: 'Final Answer', text: 'Faltan 65 días.' },
    ],
  },
  {
    id: 'both-explicit',
    question: 'La fecha límite es el 25 de diciembre de 2026. ¿Cuántos días faltan desde el 21 de octubre de 2026?',
    trace: [
      { type: 'thought', label: 'Thought', text: 'El usuario ya me ha dado las dos fechas completas; no necesito buscar nada.' },
      { type: 'action', label: 'Action', text: 'calculadora("25 de diciembre de 2026 − 21 de octubre de 2026")' },
      { type: 'observation', label: 'Observation', text: '65 días.' },
      { type: 'thought', label: 'Thought', text: 'Con este único cálculo ya puedo responder.' },
      { type: 'final', label: 'Final Answer', text: 'Faltan 65 días.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Trace player — shared by the demo and every lab variant
// ---------------------------------------------------------------------------

// Creates a self-contained player for a list of trace steps: a log element
// plus "next step" / "auto play" / "reset" controls. Returns the root
// element to mount and a reset() method so callers can clear it externally
// (e.g. when the lab switches to a different question variant).
function createTracePlayer(steps) {
  let index = 0;
  let timer = null;

  const wrapper = document.createElement('div');
  wrapper.className = 'trace-player';

  const controls = document.createElement('div');
  controls.className = 'trace-controls';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn--primary';
  nextBtn.type = 'button';
  nextBtn.textContent = 'Siguiente paso';

  const playBtn = document.createElement('button');
  playBtn.className = 'btn';
  playBtn.type = 'button';
  playBtn.textContent = 'Reproducir automático';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn';
  resetBtn.type = 'button';
  resetBtn.textContent = 'Reiniciar';

  controls.append(nextBtn, playBtn, resetBtn);

  const log = document.createElement('div');
  log.className = 'trace';

  function renderEmptyState() {
    log.innerHTML = '<p class="trace-empty">Pulsa «Siguiente paso» o «Reproducir automático» para empezar.</p>';
  }

  function appendStep(step) {
    if (index === 0) log.innerHTML = '';
    const el = document.createElement('div');
    el.className = `trace-step trace-step--${step.type}`;
    el.innerHTML = `<span class="trace-step__label">${step.label}</span><span>${step.text}</span>`;
    log.appendChild(el);
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function updateButtons() {
    const finished = index >= steps.length;
    nextBtn.disabled = finished;
    playBtn.disabled = finished;
    playBtn.textContent = timer ? 'Pausar' : 'Reproducir automático';
  }

  function advance() {
    if (index >= steps.length) return;
    appendStep(steps[index]);
    index += 1;
    updateButtons();
    if (index >= steps.length) stopAuto();
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
    updateButtons();
  }

  function reset() {
    stopAuto();
    index = 0;
    renderEmptyState();
    updateButtons();
  }

  nextBtn.addEventListener('click', advance);

  playBtn.addEventListener('click', () => {
    if (timer) { stopAuto(); return; }
    timer = setInterval(advance, 1100);
    updateButtons();
  });

  resetBtn.addEventListener('click', reset);

  renderEmptyState();

  wrapper.append(controls, log);

  return { element: wrapper, reset };
}

// ---------------------------------------------------------------------------
// Demo: single fixed trace
// ---------------------------------------------------------------------------

function buildDemo(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const question = document.createElement('p');
  question.className = 'widget-question';
  question.textContent = `Pregunta: “${DEMO_QUESTION}”`;

  const player = createTracePlayer(DEMO_TRACE);

  root.append(question, player.element);
}

// ---------------------------------------------------------------------------
// Lab: pick a phrasing, watch the trace change shape
// ---------------------------------------------------------------------------

function buildLab(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const intro = document.createElement('p');
  intro.className = 'widget-question';
  intro.textContent = 'Elige una formulación de la pregunta y observa cómo cambia el razonamiento del agente.';

  const picker = document.createElement('div');
  picker.className = 'variant-picker';

  const playerSlot = document.createElement('div');

  function selectVariant(variant) {
    playerSlot.innerHTML = '';
    const player = createTracePlayer(variant.trace);
    playerSlot.appendChild(player.element);
  }

  LAB_VARIANTS.forEach((variant, i) => {
    const label = document.createElement('label');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'lab-variant';
    input.value = variant.id;
    if (i === 0) input.checked = true;
    input.addEventListener('change', () => selectVariant(variant));

    const span = document.createElement('span');
    span.textContent = variant.question;

    label.append(input, span);
    picker.appendChild(label);
  });

  root.append(intro, picker, playerSlot);
  selectVariant(LAB_VARIANTS[0]);
}
