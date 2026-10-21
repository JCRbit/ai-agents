// Demo + lab logic for Module 1 — one call vs a loop.
//
// The demo runs a single API call side by side with a small ReAct-style
// loop, ticking both forward together so the imbalance (the loop takes
// more steps, more calls, more accumulated tokens) is visible as it
// happens rather than stated in text.
//
// The lab lets the user flip between "no tools" and "agent mode" for the
// same question and compare the two answers directly.
//
// Traces are scripted, matching the approach used in Module 2.

document.addEventListener('DOMContentLoaded', () => {
  const demoRoot = document.querySelector('#demo-root');
  const labRoot = document.querySelector('#lab-root');

  if (demoRoot) buildDemo(demoRoot);
  if (labRoot) buildLab(labRoot);
});

// ---------------------------------------------------------------------------
// Demo data — each step carries how many *new* model calls and tokens it
// represents, so the header counters can accumulate live as steps reveal.
// Observations come from tool execution, not a model call, hence callDelta 0.
// ---------------------------------------------------------------------------

const DEMO_QUESTION = '¿Qué temperatura hace ahora mismo en Tokio?';

const SINGLE_CALL_STEPS = [
  { type: 'thought', label: 'Prompt', text: '"¿Qué temperatura hace ahora mismo en Tokio?"', callDelta: 1, tokenDelta: 14 },
  { type: 'final', label: 'Respuesta', text: '"No tengo acceso a datos en tiempo real, pero en septiembre Tokio suele rondar los 26 °C."', callDelta: 0, tokenDelta: 31 },
];

const LOOP_STEPS = [
  { type: 'thought', label: 'Thought', text: 'Necesito el dato real de temperatura, no lo tengo.', callDelta: 1, tokenDelta: 22 },
  { type: 'action', label: 'Action', text: 'consultar_clima("Tokio")', callDelta: 0, tokenDelta: 9 },
  { type: 'observation', label: 'Observation', text: '29 °C, cielos despejados.', callDelta: 0, tokenDelta: 8 },
  { type: 'thought', label: 'Thought', text: 'Ya tengo el dato real, puedo responder.', callDelta: 1, tokenDelta: 34 },
  { type: 'final', label: 'Final Answer', text: '"Ahora mismo en Tokio hace 29 °C."', callDelta: 0, tokenDelta: 12 },
];

// ---------------------------------------------------------------------------
// Demo: two call-cards ticking forward together
// ---------------------------------------------------------------------------

function buildDemo(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const question = document.createElement('p');
  question.className = 'widget-question';
  question.textContent = `Pregunta: “${DEMO_QUESTION}”`;

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

  const grid = document.createElement('div');
  grid.className = 'compare-grid';

  const singleCard = createCallCard('Una sola llamada');
  const loopCard = createCallCard('Bucle de decisión (Pensar → Actuar → Observar)');
  grid.append(singleCard.element, loopCard.element);

  let tick = 0;
  let timer = null;

  function advance() {
    const singleDone = tick >= SINGLE_CALL_STEPS.length;
    const loopDone = tick >= LOOP_STEPS.length;
    if (singleDone && loopDone) return stopAuto();

    if (!singleDone) singleCard.reveal(SINGLE_CALL_STEPS[tick]);
    if (!loopDone) loopCard.reveal(LOOP_STEPS[tick]);

    tick += 1;
    updateButtons();
    if (tick >= SINGLE_CALL_STEPS.length && tick >= LOOP_STEPS.length) stopAuto();
  }

  function updateButtons() {
    const finished = tick >= SINGLE_CALL_STEPS.length && tick >= LOOP_STEPS.length;
    nextBtn.disabled = finished;
    playBtn.disabled = finished;
    playBtn.textContent = timer ? 'Pausar' : 'Reproducir automático';
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
    updateButtons();
  }

  function reset() {
    stopAuto();
    tick = 0;
    singleCard.reset();
    loopCard.reset();
    updateButtons();
  }

  nextBtn.addEventListener('click', advance);
  playBtn.addEventListener('click', () => {
    if (timer) { stopAuto(); return; }
    timer = setInterval(advance, 1100);
    updateButtons();
  });
  resetBtn.addEventListener('click', reset);

  root.append(question, controls, grid);
}

// Builds one comparison column: a header with live call/token counters and
// a log area that steps get appended into.
function createCallCard(title) {
  const element = document.createElement('div');
  element.className = 'call-card';

  const header = document.createElement('div');
  header.className = 'call-card__header';

  const titleEl = document.createElement('p');
  titleEl.className = 'call-card__title';
  titleEl.textContent = title;

  const stats = document.createElement('p');
  stats.className = 'call-card__stats';

  header.append(titleEl, stats);

  const log = document.createElement('div');
  log.className = 'call-card__log';

  element.append(header, log);

  let calls = 0;
  let tokens = 0;

  function renderStats() {
    stats.textContent = `Llamadas: ${calls} · Tokens acumulados: ~${tokens}`;
  }

  function renderEmpty() {
    log.innerHTML = '<p class="trace-empty">Esperando ejecución.</p>';
  }

  function reveal(step) {
    if (calls === 0 && tokens === 0) log.innerHTML = '';
    calls += step.callDelta;
    tokens += step.tokenDelta;
    renderStats();

    const el = document.createElement('div');
    el.className = `trace-step trace-step--${step.type}`;
    el.innerHTML = `<span class="trace-step__label">${step.label}</span><span>${step.text}</span>`;
    log.appendChild(el);
  }

  function reset() {
    calls = 0;
    tokens = 0;
    renderStats();
    renderEmpty();
  }

  reset();

  return { element, reveal, reset };
}

// ---------------------------------------------------------------------------
// Lab data
// ---------------------------------------------------------------------------

const LAB_QUESTION =
  '¿Cuál es la capital del país con más habitantes de Sudamérica y qué temperatura hace ahí ahora?';

const LAB_NO_TOOLS_STEPS = [
  {
    type: 'final',
    label: 'Respuesta',
    text: '"La capital de Brasil es Brasilia. No tengo datos en tiempo real, pero suele rondar los 24 °C en esta época." (el dato de temperatura no está verificado — es una estimación, no una consulta real)',
  },
];

const LAB_AGENT_STEPS = [
  { type: 'thought', label: 'Thought', text: 'Necesito identificar el país con más habitantes de Sudamérica.' },
  { type: 'action', label: 'Action', text: 'buscar_datos_poblacion("Sudamérica")' },
  { type: 'observation', label: 'Observation', text: 'Brasil es el país con más población de Sudamérica.' },
  { type: 'thought', label: 'Thought', text: 'Ahora necesito la capital de Brasil.' },
  { type: 'action', label: 'Action', text: 'buscar_capital("Brasil")' },
  { type: 'observation', label: 'Observation', text: 'La capital de Brasil es Brasilia.' },
  { type: 'thought', label: 'Thought', text: 'Con la ciudad identificada, consulto la temperatura real.' },
  { type: 'action', label: 'Action', text: 'consultar_clima("Brasilia")' },
  { type: 'observation', label: 'Observation', text: '22 °C, parcialmente nublado.' },
  { type: 'thought', label: 'Thought', text: 'Ya tengo todos los datos verificados.' },
  { type: 'final', label: 'Final Answer', text: 'La capital de Brasil es Brasilia, y ahora mismo hace 22 °C.' },
];

// ---------------------------------------------------------------------------
// Lab: toggle between "no tools" and "agent mode" for the same question
// ---------------------------------------------------------------------------

function buildLab(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const question = document.createElement('p');
  question.className = 'widget-question';
  question.textContent = `Pregunta: “${LAB_QUESTION}”`;

  const toggle = document.createElement('div');
  toggle.className = 'mode-toggle';

  const noToolsBtn = document.createElement('button');
  noToolsBtn.type = 'button';
  noToolsBtn.textContent = 'Sin herramientas';

  const agentBtn = document.createElement('button');
  agentBtn.type = 'button';
  agentBtn.textContent = 'Modo agente';

  toggle.append(noToolsBtn, agentBtn);

  const playerSlot = document.createElement('div');

  const reflection = document.createElement('p');
  reflection.className = 'lab-reflection';
  reflection.textContent = '¿Por qué una sola llamada no bastaba aquí?';

  function selectMode(steps, button) {
    [noToolsBtn, agentBtn].forEach((b) => b.classList.remove('is-selected'));
    button.classList.add('is-selected');
    playerSlot.innerHTML = '';
    playerSlot.appendChild(createTracePlayer(steps).element);
  }

  noToolsBtn.addEventListener('click', () => selectMode(LAB_NO_TOOLS_STEPS, noToolsBtn));
  agentBtn.addEventListener('click', () => selectMode(LAB_AGENT_STEPS, agentBtn));

  root.append(question, toggle, playerSlot, reflection);
  selectMode(LAB_NO_TOOLS_STEPS, noToolsBtn);
}

// Minimal trace player, mirroring the one in module-2.js. Kept local (not
// shared via main.js) so each module's script stays self-contained — see
// README.md's project structure notes.
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

  nextBtn.addEventListener('click', advance);
  playBtn.addEventListener('click', () => {
    if (timer) { stopAuto(); return; }
    timer = setInterval(advance, 1100);
    updateButtons();
  });
  resetBtn.addEventListener('click', () => {
    stopAuto();
    index = 0;
    renderEmptyState();
    updateButtons();
  });

  renderEmptyState();
  wrapper.append(controls, log);

  return { element: wrapper };
}
