const path = require('path');
const { loadModuleScript } = require('./runner');

const SCRIPT = path.join(__dirname, '..', 'site', 'assets', 'js', 'modules', 'module-4.js');

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.log(`  FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

function findButtons(root) {
  const all = root.querySelectorAll('button');
  return {
    next: all.find((b) => b.textContent === 'Siguiente paso'),
    reset: all.find((b) => b.textContent === 'Reiniciar'),
  };
}

// ---------------------------------------------------------------------------
// Demo: budget is deliberately 3 for 4 subtasks — should cut off with 1
// subtask marked as not completed, then the retry button should fix it
// ---------------------------------------------------------------------------

console.log('Module 4 — demo (budget too tight on purpose, then retry)');
{
  const { demoRoot } = loadModuleScript(SCRIPT, { demo: true, lab: false });
  const { next } = findButtons(demoRoot);

  for (let i = 0; i < 5; i += 1) next && !next.disabled && next.dispatch('click');

  const items = demoRoot.querySelectorAll('.subtask-item');
  check('4 subtasks rendered', items.length === 4, `got ${items.length}`);

  const doneCount = items.filter((i) => i.classList.contains('is-done')).length;
  check('exactly 3 subtasks completed before cutoff', doneCount === 3, `got ${doneCount}`);

  const cutIcon = items[3].querySelector('.subtask-item__icon');
  check('4th subtask marked as not completed (✕)', cutIcon.textContent === '✕', `got "${cutIcon.textContent}"`);

  const outcome = demoRoot.querySelector('.plan-outcome');
  check('cutoff message shown', outcome && outcome.classList.contains('plan-outcome--cutoff'));
  check('cutoff message mentions the 3/3 budget', outcome.innerHTML.includes('3/3'), outcome.innerHTML);

  const retryBtn = demoRoot.querySelectorAll('button').find((b) => b.textContent.includes('reintentar'));
  check('retry button appears after cutoff', Boolean(retryBtn));

  retryBtn.dispatch('click');
  const itemsAfterRetry = demoRoot.querySelectorAll('.subtask-item');
  const doneAfterAutoRun = () => itemsAfterRetry.filter((i) => i.classList.contains('is-done')).length;
  // retry rebuilds the runner with maxIterations = subtasks.length; drive it to completion
  const { next: nextAfterRetry } = findButtons(demoRoot);
  for (let i = 0; i < 6; i += 1) nextAfterRetry && !nextAfterRetry.disabled && nextAfterRetry.dispatch('click');

  check('after retry with the right budget, all 4 subtasks complete', doneAfterAutoRun() === 4, `got ${doneAfterAutoRun()}`);
  const successOutcome = demoRoot.querySelector('.plan-outcome--success');
  check('success outcome shown after retry', Boolean(successOutcome));
}

// ---------------------------------------------------------------------------
// Lab: low limit cuts off, higher limit (>= 4 subtasks) completes
// ---------------------------------------------------------------------------

console.log('\nModule 4 — lab (user-set iteration budget)');
{
  const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true });
  const slider = labRoot.querySelector('input');
  check('slider defaults to 4', slider.value === '4', `got ${slider.value}`);

  // Set a deliberately low budget and run
  slider.value = '2';
  const runBtn = labRoot.querySelectorAll('button').find((b) => b.textContent === 'Ejecutar plan');
  runBtn.dispatch('click');

  let next = findButtons(labRoot).next;
  for (let i = 0; i < 6; i += 1) next && !next.disabled && next.dispatch('click');

  let outcome = labRoot.querySelector('.plan-outcome');
  check('limit=2 cuts off before finishing (4 subtasks)', outcome && outcome.classList.contains('plan-outcome--cutoff'));

  // Now raise the budget and re-run
  slider.value = '5';
  runBtn.dispatch('click');
  next = findButtons(labRoot).next;
  for (let i = 0; i < 6; i += 1) next && !next.disabled && next.dispatch('click');

  outcome = labRoot.querySelector('.plan-outcome');
  check('limit=5 completes successfully', outcome && outcome.classList.contains('plan-outcome--success'));
}

console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
