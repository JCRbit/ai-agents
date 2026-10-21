const path = require('path');
const { loadModuleScript } = require('./runner');

const SCRIPT = path.join(__dirname, '..', 'site', 'assets', 'js', 'modules', 'module-2.js');

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.log(`  FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

function findButtons(root) {
  const all = root.querySelectorAll('button');
  return {
    next: all.find((b) => b.textContent === 'Siguiente paso'),
    play: all.find((b) => b.textContent.startsWith('Reproducir') || b.textContent === 'Pausar'),
    reset: all.find((b) => b.textContent === 'Reiniciar'),
  };
}

function traceStepCount(root) {
  return root.querySelectorAll('.trace-step').length;
}

// ---------------------------------------------------------------------------
// Demo: clicking "next step" 8 times reveals all 8 steps, in order, then
// disables itself
// ---------------------------------------------------------------------------

console.log('Module 2 — demo (fixed 8-step trace)');
{
  const { demoRoot } = loadModuleScript(SCRIPT, { demo: true, lab: false });
  const { next } = findButtons(demoRoot);

  check('starts empty', traceStepCount(demoRoot) === 0, `got ${traceStepCount(demoRoot)}`);

  for (let i = 0; i < 8; i += 1) next.dispatch('click');

  const steps = demoRoot.querySelectorAll('.trace-step');
  check('8 steps revealed', steps.length === 8, `got ${steps.length}`);
  check('last step is Final Answer', steps[7].classList.contains('trace-step--final'));
  check('next button disables when finished', next.disabled === true);

  // One more click past the end should not throw or add a 9th step
  next.dispatch('click');
  check('extra click beyond the end is a no-op', traceStepCount(demoRoot) === 8, `got ${traceStepCount(demoRoot)}`);
}

// ---------------------------------------------------------------------------
// Lab: the three phrasings should produce traces of different lengths —
// that's the entire pedagogical point of this lab
// ---------------------------------------------------------------------------

console.log('\nModule 2 — lab (3 phrasings, step count should differ)');
{
  const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true });
  const radios = labRoot.querySelectorAll('input');
  check('3 variant radios rendered', radios.length === 3, `got ${radios.length}`);

  const counts = [];
  radios.forEach((radio, i) => {
    radio.dispatch('change');
    const { next } = findButtons(labRoot);
    for (let n = 0; n < 10; n += 1) next && !next.disabled && next.dispatch('click');
    counts.push(traceStepCount(labRoot));
  });

  check('variant A (implicit year) has 8 steps', counts[0] === 8, `got ${counts[0]}`);
  check('variant B (explicit year) has 8 steps', counts[1] === 8, `got ${counts[1]}`);
  check(
    'variant C (both dates given) is SHORTER — no search action needed',
    counts[2] === 5 && counts[2] < counts[0],
    `got ${counts[2]}`
  );
}

console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
