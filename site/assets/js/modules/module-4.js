// Demo + lab logic for Module 4 — planning tree with an iteration budget.
//
// Both widgets decompose a goal into subtasks and complete them one per
// iteration, up to a maxIterations budget. When the budget runs out before
// every subtask is done, execution stops in a controlled way — remaining
// subtasks are marked as not completed, with an explanatory message.
// This is the tangible version of "the stopping criterion is the most
// important safety piece" from the module's theory.

document.addEventListener('DOMContentLoaded', () => {
  const demoRoot = document.querySelector('#demo-root');
  const labRoot = document.querySelector('#lab-root');

  if (demoRoot) buildDemo(demoRoot);
  if (labRoot) buildLab(labRoot);
});

// ---------------------------------------------------------------------------
// Shared: a plan runner for a fixed goal + subtask list + iteration budget.
// Renders a progress bar, the subtask list, and next/auto/reset controls.
// ---------------------------------------------------------------------------

function createPlanRunner(goal, subtasks, maxIterations) {
  let done = 0;
  let timer = null;
  let cutoff = false;

  const wrapper = document.createElement('div');

  const goalEl = document.createElement('p');
  goalEl.className = 'widget-question';
  goalEl.textContent = `Objetivo: “${goal}”`;

  const progressTrack = document.createElement('div');
  progressTrack.className = 'progress-track';
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-label', 'Iteraciones usadas');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', String(maxIterations));
  progressTrack.setAttribute('aria-valuenow', '0');
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressTrack.appendChild(progressFill);

  const progressLabel = document.createElement('p');
  progressLabel.className = 'progress-label';

  const list = document.createElement('ul');
  list.className = 'subtask-list';
  const itemEls = subtasks.map((subtask) => {
    const li = document.createElement('li');
    li.className = 'subtask-item is-pending';
    li.innerHTML = `<span class="subtask-item__icon">·</span><span>${subtask}</span>`;
    list.appendChild(li);
    return li;
  });

  const controls = document.createElement('div');
  controls.className = 'plan-controls';

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

  const outcome = document.createElement('div');
  outcome.style.display = 'none';

  const retrySlot = document.createElement('div');

  function updateProgress() {
    const pct = Math.round((done / maxIterations) * 100);
    progressFill.style.width = `${Math.min(pct, 100)}%`;
    progressFill.classList.toggle('is-cutoff', cutoff);
    progressLabel.textContent = `Iteraciones: ${done} / ${maxIterations}`;
    progressTrack.setAttribute('aria-valuenow', String(done));
  }

  function updateButtons() {
    const finished = done >= subtasks.length || cutoff;
    nextBtn.disabled = finished;
    playBtn.disabled = finished;
    playBtn.textContent = timer ? 'Pausar' : 'Reproducir automático';
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
    updateButtons();
  }

  function markActive(index) {
    itemEls.forEach((el, i) => {
      if (i === index) el.className = 'subtask-item is-active';
    });
  }

  function markDone(index) {
    const el = itemEls[index];
    el.className = 'subtask-item is-done';
    el.querySelector('.subtask-item__icon').textContent = '✓';
  }

  function markCutShort() {
    for (let i = done; i < subtasks.length; i += 1) {
      const el = itemEls[i];
      el.className = 'subtask-item is-pending';
      el.querySelector('.subtask-item__icon').textContent = '✕';
    }
  }

  function showOutcome(kind, html) {
    outcome.style.display = 'block';
    outcome.className = `plan-outcome plan-outcome--${kind}`;
    outcome.innerHTML = html;
  }

  function advance() {
    if (done >= subtasks.length || cutoff) return;

    markActive(done);
    markDone(done);
    done += 1;
    updateProgress();

    if (done >= maxIterations && done < subtasks.length) {
      cutoff = true;
      markCutShort();
      showOutcome(
        'cutoff',
        `<strong>Límite de iteraciones alcanzado (${done}/${maxIterations}).</strong> Ejecución cortada de forma controlada: así se evita un bucle sin fin, aunque la tarea quede incompleta.`
      );
      stopAuto();
      if (typeof onCutoff === 'function') onCutoff();
      return;
    }

    if (done >= subtasks.length) {
      showOutcome('success', `<strong>Plan completado</strong> en ${done} de ${maxIterations} iteraciones disponibles.`);
      stopAuto();
    }

    updateButtons();
  }

  let onCutoff = null;
  function setOnCutoff(fn) { onCutoff = fn; }

  function reset() {
    stopAuto();
    done = 0;
    cutoff = false;
    itemEls.forEach((el, i) => {
      el.className = 'subtask-item is-pending';
      el.querySelector('.subtask-item__icon').textContent = '·';
    });
    outcome.style.display = 'none';
    retrySlot.innerHTML = '';
    updateProgress();
    updateButtons();
  }

  nextBtn.addEventListener('click', advance);
  playBtn.addEventListener('click', () => {
    if (timer) { stopAuto(); return; }
    timer = setInterval(advance, 900);
    updateButtons();
  });
  resetBtn.addEventListener('click', reset);

  updateProgress();
  updateButtons();

  wrapper.append(goalEl, progressTrack, progressLabel, list, controls, outcome, retrySlot);

  return { element: wrapper, reset, setOnCutoff, retrySlot };
}

// ---------------------------------------------------------------------------
// Demo: a budget that is deliberately too tight, with a one-click retry
// ---------------------------------------------------------------------------

const DEMO_GOAL = 'Resumir la temperatura en 3 ciudades y calcular la media';
const DEMO_SUBTASKS = [
  'Consultar temperatura en Madrid',
  'Consultar temperatura en Tokio',
  'Consultar temperatura en Bogotá',
  'Calcular la media y redactar la conclusión',
];

function buildDemo(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const runner = createPlanRunner(DEMO_GOAL, DEMO_SUBTASKS, 3); // one short on purpose

  runner.setOnCutoff(() => {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn--primary';
    retryBtn.type = 'button';
    retryBtn.textContent = `Aumentar límite a ${DEMO_SUBTASKS.length} y reintentar`;
    retryBtn.style.marginTop = '0.75rem';
    retryBtn.addEventListener('click', () => {
      root.innerHTML = '';
      const fixedRunner = createPlanRunner(DEMO_GOAL, DEMO_SUBTASKS, DEMO_SUBTASKS.length);
      root.appendChild(fixedRunner.element);
    });
    runner.retrySlot.appendChild(retryBtn);
  });

  root.appendChild(runner.element);
}

// ---------------------------------------------------------------------------
// Lab: the user sets the budget before running
// ---------------------------------------------------------------------------

const LAB_GOAL = 'Organizar 5 datos de ventas mensuales en una tabla y sacar una conclusión';
const LAB_SUBTASKS = [
  'Leer y validar los 5 datos (Ene 120, Feb 98, Mar 143, Abr 110, May 156)',
  'Construir la tabla mes → unidades vendidas',
  'Calcular la tendencia (creciente / decreciente)',
  'Redactar la conclusión final',
];

function buildLab(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const intro = document.createElement('p');
  intro.className = 'widget-question';
  intro.textContent = `Tarea: “${LAB_GOAL}”. Fija el límite de iteraciones antes de ejecutar.`;

  const limitRow = document.createElement('div');
  limitRow.className = 'iteration-limit';

  const limitLabel = document.createElement('label');
  limitLabel.setAttribute('for', 'iteration-limit-slider');
  limitLabel.innerHTML = 'Límite: <strong id="limit-value">4</strong>';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'iteration-limit-slider';
  slider.min = '2';
  slider.max = '8';
  slider.value = '4';

  const runBtn = document.createElement('button');
  runBtn.className = 'btn btn--primary';
  runBtn.type = 'button';
  runBtn.textContent = 'Ejecutar plan';
  runBtn.style.alignSelf = 'flex-start';

  slider.addEventListener('input', () => {
    limitLabel.querySelector('#limit-value').textContent = slider.value;
  });

  limitRow.append(limitLabel, slider);

  const runnerSlot = document.createElement('div');

  function run() {
    runnerSlot.innerHTML = '';
    const runner = createPlanRunner(LAB_GOAL, LAB_SUBTASKS, Number(slider.value));
    runnerSlot.appendChild(runner.element);
  }

  runBtn.addEventListener('click', run);

  root.append(intro, limitRow, runBtn, runnerSlot);
  run();
}
