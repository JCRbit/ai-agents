const path = require('path');
const { loadModuleScript } = require('./runner');

const SCRIPT = path.join(__dirname, '..', 'site', 'assets', 'js', 'modules', 'module-3.js');

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log(`  OK   ${label}`);
  else {
    failures += 1;
    console.log(`  FAIL ${label}${extra ? ' — ' + extra : ''}`);
  }
}

function selectedToolName(root) {
  const grid = root.querySelector('.tool-grid');
  const selected = grid.children.find((c) => c.classList.contains('is-selected'));
  return selected ? selected.querySelector('.tool-card__name').textContent : null;
}

async function runDemoAndLabTests() {
  console.log('Module 3 — demo (example chips)');
  {
    const { demoRoot } = loadModuleScript(SCRIPT, { demo: true, lab: false });
    const chips = demoRoot.querySelectorAll('.chip');
    check('5 example chips rendered', chips.length === 5, `got ${chips.length}`);

    const expected = ['buscador_web', 'calculadora', 'traductor', 'base_de_datos_interna'];
    chips.slice(0, 4).forEach((chip, i) => {
      chip.dispatch('click');
      check(`chip "${chip.textContent}" → ${expected[i]}`, selectedToolName(demoRoot) === expected[i]);
    });
  }

  console.log('\nModule 3 — lab (ambiguous question challenge)');
  {
    const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true });
    check('ambiguous question wrongly picks calculadora on load', selectedToolName(labRoot) === 'calculadora');

    const hintBtn = labRoot.children.find((c) => c.tagName === 'BUTTON' && c.textContent === 'Ver pista');
    const hintBox = labRoot.children.find((c) => c.classList.contains('hint-box'));
    check('hint button removed from guided lab', !hintBtn);
    check('associated hint text removed from guided lab', !hintBox);

    const input = labRoot.querySelectorAll('input').find((i) => i.getAttribute('aria-label') === 'Pregunta para el selector de herramientas');
    input.value = '¿Desde cuándo no llueve en Madrid?';
    labRoot.querySelectorAll('button').find((b) => b.textContent === 'Ejecutar').dispatch('click');
    check('corrected question picks buscador_web', selectedToolName(labRoot) === 'buscador_web');
  }
}

async function runFailureTest() {
  console.log('\nModule 3 — Groq real-API failure falls back to simulation');
  const failingFetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'upstream_error' }) });
  const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true, fetch: failingFetch });

  labRoot.querySelectorAll('button').find((b) => b.textContent.includes('Configurar API real')).dispatch('click');
  const panel = labRoot.querySelector('.api-settings');
  const keyInput = panel.querySelectorAll('input').find((i) => i.type === 'password');
  keyInput.value = 'gsk_test_key';
  panel.querySelectorAll('button').find((b) => b.textContent === 'Guardar').dispatch('click');

  const input = labRoot.querySelectorAll('input').find((i) => i.getAttribute('aria-label') === 'Pregunta para el selector de herramientas');
  input.value = '¿Qué tiempo hace en Madrid?';
  await labRoot.querySelectorAll('button').find((b) => b.textContent === 'Ejecutar').dispatch('click');

  const errorEl = labRoot.querySelector('.api-error');
  check('error banner shown on failure', errorEl.style.display === 'block');
  check('error banner explains the fallback', errorEl.textContent.includes('simulación'));
  check('falls back to simulated buscador_web', selectedToolName(labRoot) === 'buscador_web');
  check('score is numeric after fallback', /Puntuación: \d/.test(labRoot.querySelector('.tool-card__score').textContent));
}

async function runGroqTest() {
  console.log('\nModule 3 — Groq real-API mode (mocked API)');
  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, headers: opts.headers, body: JSON.parse(opts.body) });
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            reasoning: 'La pregunta pide información meteorológica actual.',
            content: null,
            tool_calls: [{
              id: 'call_1',
              type: 'function',
              function: {
                name: 'buscador_web',
                arguments: JSON.stringify({ query: 'clima en Madrid' }),
              },
            }],
          },
        }],
      }),
    };
  };

  const { labRoot } = loadModuleScript(SCRIPT, { demo: false, lab: true, fetch: mockFetch });
  labRoot.querySelectorAll('button').find((b) => b.textContent.includes('Configurar API real')).dispatch('click');
  const panel = labRoot.querySelector('.api-settings');
  const inputs = panel.querySelectorAll('input');
  inputs.find((i) => i.type === 'password').value = 'gsk_test_key';
  inputs.find((i) => i.getAttribute('aria-label') === 'Modelo de Groq').value = 'openai/gpt-oss-120b';
  panel.querySelectorAll('button').find((b) => b.textContent === 'Guardar').dispatch('click');

  check('Groq configuration fields are present', panel.querySelectorAll('input').length === 2);
  check('Groq status confirms configured key', panel.querySelector('.api-status').textContent.includes('Groq'));

  const input = labRoot.querySelectorAll('input').find((i) => i.getAttribute('aria-label') === 'Pregunta para el selector de herramientas');
  input.value = '¿Qué tiempo hace en Madrid?';
  await labRoot.querySelectorAll('button').find((b) => b.textContent === 'Ejecutar').dispatch('click');

  check('Groq endpoint called', fetchCalls[0]?.url === 'https://api.groq.com/openai/v1/chat/completions');
  check('Groq key sent as Bearer credential', fetchCalls[0]?.headers?.Authorization === 'Bearer gsk_test_key');
  check('Groq model sent correctly', fetchCalls[0]?.body?.model === 'openai/gpt-oss-120b');
  check('Groq request includes 4 function tools', Array.isArray(fetchCalls[0]?.body?.tools) && fetchCalls[0].body.tools.length === 4);
  check('buscador_web selected from Groq tool call', selectedToolName(labRoot) === 'buscador_web');
  check('selected card identifies Groq', labRoot.querySelector('.tool-thought').textContent.includes('Groq · API real'));
  check('Groq reasoning is displayed', labRoot.querySelector('.tool-thought').textContent.includes('información meteorológica actual'));
}

(async () => {
  await runDemoAndLabTests();
  await runFailureTest();
  await runGroqTest();
  console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
  process.exit(failures === 0 ? 0 : 1);
})();
