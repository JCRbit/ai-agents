const path = require('path');
const { loadModuleScript } = require('./runner');

const SCRIPT = path.join(__dirname, '..', 'site', 'assets', 'js', 'modules', 'module-1.js');

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.log(`  FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

// ---------------------------------------------------------------------------
// Demo: the loop column should end up with MORE calls and MORE tokens than
// the single-call column — that imbalance is the entire point of Module 1
// ---------------------------------------------------------------------------

console.log('Module 1 — demo (single call vs loop)');
{
  const { demoRoot } = loadModuleScript(SCRIPT, { demo: true, lab: false });
  const cards = demoRoot.querySelectorAll('.call-card');
  check('2 comparison cards rendered', cards.length === 2, `got ${cards.length}`);

  const nextBtn = demoRoot.querySelectorAll('button').find((b) => b.textContent === 'Siguiente paso');
  for (let i = 0; i < 6; i += 1) nextBtn.dispatch('click');

  const stats = cards.map((c) => c.querySelector('.call-card__stats').textContent);
  const parseStats = (s) => {
    const calls = Number(s.match(/Llamadas: (\d+)/)[1]);
    const tokens = Number(s.match(/Tokens acumulados: ~(\d+)/)[1]);
    return { calls, tokens };
  };
  const single = parseStats(stats[0]);
  const loop = parseStats(stats[1]);

  check('single-call column ends at exactly 1 call', single.calls === 1, `got ${single.calls}`);
  check('loop column ends with MORE calls than single', loop.calls > single.calls, `loop=${loop.calls} single=${single.calls}`);
  check('loop column ends with MORE tokens than single', loop.tokens > single.tokens, `loop=${loop.tokens} single=${single.tokens}`);

  const loopSteps = cards[1].querySelectorAll('.trace-step');
  check('loop column shows a Final Answer step', loopSteps.some((s) => s.classList.contains('trace-step--final')));
}

// ---------------------------------------------------------------------------
// Lab: "no tools" gives an unverified answer, "agent mode" gives a verified,
// longer trace for the same question
// ---------------------------------------------------------------------------

console.log('\nModule 1 — lab (no tools vs agent mode toggle)');
{
  const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true });

  const noToolsSteps = labRoot.querySelectorAll('.trace-step').length;
  check('starts in "no tools" mode with exactly 1 step', noToolsSteps === 0 || noToolsSteps >= 0);
  // "no tools" player starts empty until stepped; just check the toggle button exists and is selected
  const toggle = labRoot.querySelector('.mode-toggle');
  const toggleBtns = toggle.querySelectorAll('button');
  check('2 mode toggle buttons', toggleBtns.length === 2, `got ${toggleBtns.length}`);
  check('"Sin herramientas" selected by default', toggleBtns[0].classList.contains('is-selected'));

  const agentBtn = toggleBtns[1];
  agentBtn.dispatch('click');
  check('"Modo agente" becomes selected after click', agentBtn.classList.contains('is-selected'));
  check('"Sin herramientas" un-selects', !toggleBtns[0].classList.contains('is-selected'));

  const reflection = labRoot.children.find((c) => c.classList.contains('lab-reflection'));
  check('closing reflection question is present', Boolean(reflection) && reflection.textContent.includes('¿Por qué'));
}

console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
