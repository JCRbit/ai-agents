// Demo + lab logic for Module 3 — how the model picks a tool.
//
// Two modes coexist here:
//   - Simulation (default, always available): keyword-matching heuristic,
//     zero setup, zero cost. Used by the Demo always, and by the Lab
//     whenever no real backend is configured.
//   - Real API (Lab only, opt-in): the Lab can call Groq directly with a
//     personal API key. If the call fails for any reason, the Lab shows why
//     and falls back to the simulation rather than breaking.
//
// The Demo intentionally stays simulation-only: it's the first thing a
// visitor sees, and it has to work with nothing configured.

document.addEventListener('DOMContentLoaded', () => {
  const demoRoot = document.querySelector('#demo-root');
  const labRoot = document.querySelector('#lab-root');

  if (demoRoot) buildDemo(demoRoot);
  if (labRoot) buildLab(labRoot);
});

// ---------------------------------------------------------------------------
// Tools and their scoring patterns: [phrase, weight]. A phrase scores if it
// appears anywhere in the (lowercased) question. Multi-word phrases carry
// more weight, which is what lets a phrase like "cuánto tiempo" outscore a
// single "llueve" match on the ambiguous example below.
//
// These are also used by the real Groq path so the simulated and real
// paths describe the same four tools, by id.
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    id: 'buscador_web',
    name: 'buscador_web',
    description: 'Busca información actualizada en internet sobre un tema.',
    patterns: [['clima', 2], ['temperatura', 2], ['llueve', 2], ['noticia', 2], ['tiempo', 1], ['actual', 1], ['hoy', 1], ['precio', 1]],
  },
  {
    id: 'calculadora',
    name: 'calculadora',
    description: 'Realiza cálculos numéricos: sumas, restas, porcentajes, conversiones.',
    patterns: [['cuánto tiempo', 3], ['calcula', 2], ['porcentaje', 2], ['suma', 2], ['resta', 2], ['multiplica', 2], ['divide', 2], ['cuánto es', 2], ['cuántos', 1], ['cuánto', 1]],
  },
  {
    id: 'base_de_datos_interna',
    name: 'base_de_datos_interna',
    description: 'Consulta datos internos: clientes, pedidos, ventas, inventario.',
    patterns: [['cliente', 2], ['pedido', 2], ['ventas', 2], ['inventario', 2], ['factura', 2]],
  },
  {
    id: 'traductor',
    name: 'traductor',
    description: 'Traduce texto entre distintos idiomas.',
    patterns: [['traduce', 2], ['traducción', 2], ['en inglés', 2], ['en francés', 2], ['cómo se dice', 2]],
  },
];

const GROQ_TOOLS = TOOLS.map((tool) => {
  const schemas = {
    buscador_web: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Qué buscar' } },
      required: ['query'],
    },
    calculadora: {
      type: 'object',
      properties: { expression: { type: 'string', description: 'La operación a resolver' } },
      required: ['expression'],
    },
    base_de_datos_interna: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Qué dato interno consultar' } },
      required: ['query'],
    },
    traductor: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Texto a traducir' },
        target_language: { type: 'string', description: 'Idioma de destino' },
      },
      required: ['text', 'target_language'],
    },
  };

  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: schemas[tool.id],
    },
  };
});

const SYSTEM_PROMPT_GROQ = `Eres el motor de decisión de un agente educativo que enseña cómo un modelo elige entre herramientas.
Para la pregunta del usuario, decide si necesitas una herramienta. Si la necesitas, invoca exactamente una vez la herramienta más adecuada con argumentos adecuados. Si no necesitas ninguna, responde directamente. Explica brevemente tu decisión en el campo de razonamiento si el modelo lo proporciona. No ejecutes realmente las herramientas: solo decide cuál debería usarse.`;

const EXAMPLES = [
  '¿Qué tiempo hace en Madrid?',
  '¿Cuánto es el 15% de 240?',
  "Traduce 'buenos días' al inglés",
  '¿Cuántos pedidos tiene cada cliente este mes?',
  '¿Cuánto tiempo hace que no llueve en Madrid?',
];

const AMBIGUOUS_QUESTION = '¿Cuánto tiempo hace que no llueve en Madrid?';
const GROQ_API_KEY_STORAGE_KEY = 'agentes-ia:groq-api-key';
const GROQ_MODEL_STORAGE_KEY = 'agentes-ia:groq-model';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ---------------------------------------------------------------------------
// Simulation scoring
// ---------------------------------------------------------------------------

function scoreText(text) {
  const lower = text.toLowerCase();
  const scores = {};

  TOOLS.forEach((tool) => {
    let total = 0;
    tool.patterns.forEach(([phrase, weight]) => {
      if (lower.includes(phrase)) total += weight;
    });
    scores[tool.id] = total;
  });

  let best = null;
  TOOLS.forEach((tool) => {
    if (scores[tool.id] > 0 && (!best || scores[tool.id] > scores[best.id])) best = tool;
  });

  return { scores, best };
}

// ---------------------------------------------------------------------------
// Real API: endpoint storage + the actual call
// ---------------------------------------------------------------------------

function getStoredGroqKey() {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem(GROQ_API_KEY_STORAGE_KEY)) || '';
  } catch {
    return '';
  }
}

function setStoredGroqKey(key) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (key) localStorage.setItem(GROQ_API_KEY_STORAGE_KEY, key);
    else localStorage.removeItem(GROQ_API_KEY_STORAGE_KEY);
  } catch {
    // Storage unavailable — the key will not persist across reloads.
  }
}

function getStoredGroqModel() {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem(GROQ_MODEL_STORAGE_KEY)) || DEFAULT_GROQ_MODEL;
  } catch {
    return DEFAULT_GROQ_MODEL;
  }
}

function setStoredGroqModel(model) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (model) localStorage.setItem(GROQ_MODEL_STORAGE_KEY, model);
    else localStorage.removeItem(GROQ_MODEL_STORAGE_KEY);
  } catch {
    // Storage unavailable — use the default model for this session.
  }
}

async function callGroqApi(apiKey, question, model) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_GROQ_MODEL,
      temperature: 0,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_GROQ },
        { role: 'user', content: question },
      ],
      tools: GROQ_TOOLS,
      tool_choice: 'auto',
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson.error?.message || errJson.error || '';
    } catch {
      // Keep the HTTP status as the useful error.
    }
    throw new Error(`http_${res.status}${detail ? '_' + String(detail).slice(0, 120) : ''}`);
  }

  return res.json();
}

function normalizeGroqResult(data, model) {
  const message = data?.choices?.[0]?.message || {};
  const toolCall = Array.isArray(message.tool_calls) ? message.tool_calls[0] : null;
  let toolInput = null;

  if (toolCall?.function?.arguments) {
    try {
      toolInput = JSON.parse(toolCall.function.arguments);
    } catch {
      toolInput = { raw: toolCall.function.arguments };
    }
  }

  return {
    thought: message.reasoning?.trim() || '',
    tool: toolCall?.function?.name || null,
    toolInput,
    directAnswer: toolCall ? null : (message.content || 'Sin respuesta.'),
    model: model || DEFAULT_GROQ_MODEL,
    provider: 'groq',
  };
}

function describeApiError(err) {
  const msg = (err && err.message) || '';
  if (msg.startsWith('http_429')) return 'límite de peticiones alcanzado';
  if (msg.startsWith('http_403')) return 'origen no permitido por el backend';
  if (msg.startsWith('http_5')) return 'error del servidor';
  if (msg.startsWith('http_')) return `respuesta inesperada (${msg.replace('http_', '')})`;
  return 'sin conexión o URL incorrecta';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Shared widget: input + example chips + tool grid + verdict.
// `allowRealApi` (Lab only) adds the settings toggle and the real-API path.
// ---------------------------------------------------------------------------

function createToolSelector(initialQuestion, { allowRealApi = false } = {}) {
  const container = document.createElement('div');

  const inputRow = document.createElement('div');
  inputRow.className = 'tool-input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = initialQuestion || '';
  input.placeholder = 'Escribe una pregunta…';
  input.setAttribute('aria-label', 'Pregunta para el selector de herramientas');

  const runBtn = document.createElement('button');
  runBtn.className = 'btn btn--primary';
  runBtn.type = 'button';
  runBtn.textContent = 'Ejecutar';

  inputRow.append(input, runBtn);

  const chipsRow = document.createElement('div');
  chipsRow.className = 'example-chips';
  EXAMPLES.forEach((example) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = example;
    chip.addEventListener('click', () => {
      input.value = example;
      return run();
    });
    chipsRow.appendChild(chip);
  });

  // ---- Real-API settings panel (Lab only) ----
  let settingsToggle = null;
  let settingsPanel = null;
  let apiErrorEl = null;

  if (allowRealApi) {
    settingsToggle = document.createElement('button');
    settingsToggle.type = 'button';
    settingsToggle.className = 'btn';
    settingsToggle.textContent = '⚙ Configurar API real';
    settingsToggle.style.alignSelf = 'flex-start';

    settingsPanel = document.createElement('div');
    settingsPanel.className = 'api-settings';
    settingsPanel.style.display = 'none';

    const groqKeyInput = document.createElement('input');
    groqKeyInput.type = 'password';
    groqKeyInput.placeholder = 'gsk_…';
    groqKeyInput.value = getStoredGroqKey();
    groqKeyInput.autocomplete = 'off';
    groqKeyInput.setAttribute('aria-label', 'API key de Groq');

    const groqModelInput = document.createElement('input');
    groqModelInput.type = 'text';
    groqModelInput.placeholder = DEFAULT_GROQ_MODEL;
    groqModelInput.value = getStoredGroqModel();
    groqModelInput.setAttribute('aria-label', 'Modelo de Groq');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn--primary';
    saveBtn.textContent = 'Guardar';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn';
    clearBtn.textContent = 'Quitar';

    const groqKeyRow = document.createElement('div');
    groqKeyRow.className = 'tool-input-row';
    groqKeyRow.append(groqKeyInput, groqModelInput);

    const actionsRow = document.createElement('div');
    actionsRow.className = 'tool-input-row';
    actionsRow.append(saveBtn, clearBtn);

    const statusEl = document.createElement('p');
    statusEl.className = 'api-status';

    const helpEl = document.createElement('p');
    helpEl.className = 'api-status';
    helpEl.textContent = 'La clave de Groq se guarda solo en este navegador (localStorage) y se envía directamente a Groq. No la incluyas nunca en el repositorio.';

    function refreshStatus() {
      const key = getStoredGroqKey();
      statusEl.textContent = key
        ? `Modo: Groq (${getStoredGroqModel()}) — API key configurada en este navegador`
        : 'Modo: simulación local — añade una API key de Groq para activar el modelo real';
    }

    saveBtn.addEventListener('click', () => {
      setStoredGroqKey(groqKeyInput.value.trim());
      setStoredGroqModel(groqModelInput.value.trim() || DEFAULT_GROQ_MODEL);
      refreshStatus();
    });

    clearBtn.addEventListener('click', () => {
      groqKeyInput.value = '';
      setStoredGroqKey('');
      setStoredGroqModel('');
      groqModelInput.value = DEFAULT_GROQ_MODEL;
      refreshStatus();
    });

    settingsToggle.addEventListener('click', () => {
      const showing = settingsPanel.style.display === 'block';
      settingsPanel.style.display = showing ? 'none' : 'block';
      settingsToggle.textContent = showing ? '⚙ Configurar API real' : '⚙ Ocultar configuración';
    });

    refreshStatus();
    settingsPanel.append(groqKeyRow, actionsRow, statusEl, helpEl);

    apiErrorEl = document.createElement('p');
    apiErrorEl.className = 'api-error';
    apiErrorEl.style.display = 'none';
  }

  const grid = document.createElement('div');
  grid.className = 'tool-grid';

  const cardEls = {};
  TOOLS.forEach((tool) => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
      <p class="tool-card__name">${tool.name}</p>
      <p class="tool-card__desc">${tool.description}</p>
      <p class="tool-card__score"></p>
    `;
    grid.appendChild(card);
    cardEls[tool.id] = card;
  });

  const thoughtEl = document.createElement('div');
  thoughtEl.className = 'tool-thought';
  thoughtEl.style.display = 'none';

  const caption = document.createElement('p');
  caption.className = 'sim-caption';
  caption.textContent = 'Simulación simplificada (coincidencia de palabras clave) para ilustrar el problema — un LLM real decide de forma probabilística, no con reglas fijas.';

  function runSimulated(text) {
    const { scores, best } = scoreText(text);

    TOOLS.forEach((tool) => {
      const card = cardEls[tool.id];
      card.classList.toggle('is-selected', Boolean(best) && tool.id === best.id);
      card.querySelector('.tool-card__score').textContent = `Puntuación: ${scores[tool.id]}`;
    });

    thoughtEl.style.display = 'block';
    thoughtEl.innerHTML = best
      ? `<span class="trace-step__label">Thought</span>La pregunta encaja mejor con <strong>${best.name}</strong> (puntuación ${scores[best.id]}).`
      : `<span class="trace-step__label">Thought</span>Ninguna herramienta encaja con claridad — respondería directamente, sin usar herramientas.`;
  }

  function setLoadingState() {
    TOOLS.forEach((tool) => {
      const card = cardEls[tool.id];
      card.classList.remove('is-selected');
      card.querySelector('.tool-card__score').textContent = '…';
    });
    thoughtEl.style.display = 'block';
    thoughtEl.innerHTML = '<span class="trace-step__label">Thought</span>Pensando… (llamando a la API real)';
    if (apiErrorEl) apiErrorEl.style.display = 'none';
  }

  function applyRealResult(data) {
    TOOLS.forEach((tool) => {
      const card = cardEls[tool.id];
      const chosen = data.tool === tool.id;
      card.classList.toggle('is-selected', chosen);
      card.querySelector('.tool-card__score').textContent = chosen ? `Elegida por Groq` : '—';
    });

    thoughtEl.style.display = 'block';
    const badge = '<span class="api-real-badge">Groq · API real</span> ';
    thoughtEl.innerHTML = data.tool
      ? `<span class="trace-step__label">Thought</span>${badge}${escapeHtml(data.thought || '')} → llama a <strong>${data.tool}</strong>.`
      : `<span class="trace-step__label">Thought</span>${badge}${escapeHtml(data.thought || '')} Respuesta directa: "${escapeHtml(data.directAnswer || '')}"`;
  }

  async function runGroq(text, apiKey, model) {
    setLoadingState();
    try {
      const data = await callGroqApi(apiKey, text, model);
      applyRealResult(normalizeGroqResult(data, model));
    } catch (err) {
      if (apiErrorEl) {
        apiErrorEl.style.display = 'block';
        apiErrorEl.textContent = `No se pudo contactar con Groq (${describeApiError(err)}). Mostrando la simulación en su lugar.`;
      }
      runSimulated(text);
    }
  }

  function run() {
    const text = input.value.trim();
    if (!text) return undefined;

    if (!allowRealApi) {
      runSimulated(text);
      return undefined;
    }

    const groqKey = getStoredGroqKey();
    if (groqKey) {
      return runGroq(text, groqKey, getStoredGroqModel());
    }

    runSimulated(text);
    return undefined;
  }

  runBtn.addEventListener('click', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') run();
  });

  container.append(inputRow, chipsRow);
  if (settingsToggle) container.append(settingsToggle, settingsPanel);
  container.append(grid, thoughtEl);
  if (apiErrorEl) container.append(apiErrorEl);
  if (!allowRealApi) container.append(caption);

  if (initialQuestion) run();

  return { element: container, run, settingsToggle, settingsPanel };
}

// ---------------------------------------------------------------------------
// Demo: free exploration (simulation only — must work with zero setup)
// ---------------------------------------------------------------------------

function buildDemo(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const intro = document.createElement('p');
  intro.className = 'widget-question';
  intro.textContent = 'Escribe una pregunta (o prueba un ejemplo) y observa qué herramienta elige el agente, y por qué.';

  const selector = createToolSelector(EXAMPLES[0]);

  root.append(intro, selector.element);
}

// ---------------------------------------------------------------------------
// Lab: fix the ambiguous question — with an opt-in real-API mode
// ---------------------------------------------------------------------------

function buildLab(root) {
  root.classList.add('is-active');
  root.innerHTML = '';

  const selector = createToolSelector(AMBIGUOUS_QUESTION, { allowRealApi: true });

  // The API configuration belongs at the top of the guided lab, where the
  // challenge text used to be. The panel itself is moved here from the
  // selector so the control remains part of the same component.
  const apiConfig = document.createElement('div');
  apiConfig.className = 'lab-api-config';
  apiConfig.append(selector.settingsToggle, selector.settingsPanel);

  // Keep the guided lab focused on the interactive tool selector; the hint
  // button and its associated explanatory text have been removed.
  root.append(apiConfig, selector.element);
}
