// Lightweight client-side language toggle for the tutorial.
// No translation service or API key is required. The selected language is
// persisted locally and applies to static content as well as dynamically
// rendered demo/lab content.
(() => {
  const STORAGE_KEY = 'agentes-ia:language';

  const translations = {
    'Inicio': 'Home',
    '01 Fundamentos': '01 Foundations',
    '02 ReAct': '02 ReAct',
    '03 Herramientas': '03 Tools',
    '04 Memoria': '04 Memory',
    '05 Panorama': '05 Overview',
    'Introducción a Agentes de IA': 'Introduction to AI Agents',
    'Agentes de': 'AI Agents',
    'IA': '',
    'introducción a agentes de ia': 'introduction to AI agents',
    'Un LLM genera respuestas.': 'An LLM generates responses.',
    'Un agente ejecuta un bucle.': 'An agent runs a loop.',
    'Cinco módulos prácticos para entender cómo un sistema basado en un modelo de lenguaje puede perseguir objetivos en varios pasos: interpreta el contexto, propone acciones, usa herramientas y evalúa resultados bajo límites definidos.': 'Five practical modules to understand how a language-model-based system can pursue goals across multiple steps: it interprets context, proposes actions, uses tools, and evaluates results within defined limits.',
    'Empezar por el Módulo 1 →': 'Start with Module 1 →',
    'De una llamada única al bucle de decisión de un agente': 'From a single call to an agent decision loop',
    'Arriba, una entrada pasa por un modelo y produce una salida. Abajo, el sistema percibe el contexto, razona y decide, actúa y evalúa el resultado. Si el objetivo no se cumple, vuelve a decidir; si se cumple o alcanza un límite, finaliza.': 'Above, an input passes through a model and produces an output. Below, the system perceives context, reasons and decides, acts, and evaluates the result. If the goal is not met, it decides again; if the goal is met or a limit is reached, it stops.',
    'LLAMADA ÚNICA · UNA PASADA': 'SINGLE CALL · ONE PASS',
    'Entrada': 'Input',
    'Modelo': 'Model',
    'Salida': 'Output',
    'SISTEMA AGENTE · BUCLE DE CONTROL': 'AGENT SYSTEM · CONTROL LOOP',
    '1 · Percibir': '1 · Perceive',
    'contexto / estado': 'context / state',
    '2 · Decidir': '2 · Decide',
    'razonar / planificar': 'reason / plan',
    '3 · Actuar': '3 · Act',
    'herramienta / acción': 'tool / action',
    '4 · Evaluar': '4 · Evaluate',
    '¿qué ha cambiado?': 'what changed?',
    'no resuelto': 'not solved',
    'Parar': 'Stop',
    'éxito o límite': 'success or limit',
    'resuelto': 'solved',
    'El resultado actualiza el estado y condiciona la siguiente decisión.': 'The result updates the state and influences the next decision.',
    'El modelo propone; el sistema agente coordina las acciones, incorpora observaciones y decide si continúa o termina.': 'The model proposes; the agent system coordinates actions, incorporates observations, and decides whether to continue or stop.',
    'Ruta de aprendizaje': 'Learning path',
    'Cada módulo sigue la misma estructura: teoría desde cero, una demo visual del concepto en acción, y un laboratorio guiado para probarlo tú mismo.': 'Each module follows the same structure: theory from scratch, a visual demo of the concept in action, and a guided lab to try it yourself.',
    'Fundamentos: de completar texto a tomar decisiones': 'Foundations: from text completion to decision-making',
    'La diferencia entre una función pura y un bucle con estado, y los cuatro componentes mínimos de un agente.': 'The difference between a pure function and a stateful loop, and the four minimum components of an agent.',
    'Teoría': 'Theory',
    'Demo: una llamada vs un bucle': 'Demo: one call vs a loop',
    'Lab guiado': 'Guided lab',
    'Laboratorio guiado': 'Guided lab',
    'El bucle ReAct: razonar y actuar': 'The ReAct loop: reason and act',
    'El patrón Thought / Action / Observation, cómo se intercalan acciones y observaciones, y qué puede y qué no puede garantizar una traza de razonamiento.': 'The Thought / Action / Observation pattern, how actions and observations alternate, and what a reasoning trace can and cannot guarantee.',
    'Demo: traza en vivo': 'Demo: live trace',
    'Herramientas: cómo decide el modelo': 'Tools: how the model decides',
    'Tool schemas, function calling y por qué la descripción de una herramienta importa más que su implementación.': 'Tool schemas, function calling, and why a tool description matters more than its implementation.',
    'Demo: selector de herramientas': 'Demo: tool selector',
    'Memoria, planificación y criterio de parada': 'Memory, planning, and stopping criteria',
    'Memoria de corto y largo plazo, descomposición de tareas, y por qué el criterio de parada es la pieza de seguridad más importante.': 'Short- and long-term memory, task decomposition, and why the stopping criterion is the most important safety component.',
    'Demo: árbol de planificación': 'Demo: planning tree',
    'Panorama de industria': 'Industry overview',
    'Frameworks reales, el caso histórico de AutoGPT, y cuándo tiene sentido pasar a un sistema multi-agente.': 'Real frameworks, the historical AutoGPT case, and when it makes sense to move to a multi-agent system.',
    'Referencias para seguir explorando': 'References for further exploration',
    'Bucles de decisión autónomos y razonamiento independiente': 'Autonomous decision loops and independent reasoning',

    '/ Módulo 01': '/ Module 01',
    '/ Módulo 02': '/ Module 02',
    '/ Módulo 03': '/ Module 03',
    '/ Módulo 04': '/ Module 04',
    '/ Módulo 05': '/ Module 05',
    '01 ·': '01 ·',
    '02 ·': '02 ·',
    '03 ·': '03 ·',
    '04 ·': '04 ·',
    '05 ·': '05 ·',
    'Qué aporta un modelo de lenguaje y qué añade el sistema que lo rodea para seleccionar acciones, usar herramientas y perseguir un objetivo en varios pasos.': 'What a language model provides and what the surrounding system adds to select actions, use tools, and pursue a goal across multiple steps.',
    'Qué hace realmente un LLM': 'What an LLM actually does',
    'Un LLM procesa el contexto de entrada y genera una salida token a token, estimando qué token producir a continuación. Puede resolver tareas que requieren varios pasos, pero eso no implica que tenga intención o comprensión humana. Su salida puede incluir explicaciones útiles, aunque una explicación generada no garantiza que el proceso descrito sea completo, fiel ni correcto.': 'An LLM processes input context and generates an output token by token, estimating which token to produce next. It can solve tasks that require multiple steps, but that does not imply human intent or understanding. Its output can include useful explanations, although a generated explanation does not guarantee that the described process is complete, faithful, or correct.',
    'De la función al bucle': 'From function to loop',
    'Como simplificación didáctica, podemos representar una llamada como': 'As a teaching simplification, we can represent a call as',
    'entrada → modelo → salida': 'input → model → output',
    '. Un sistema agente añade un ciclo de control: mantiene el estado de la tarea, solicita al modelo una decisión, ejecuta una herramienta si procede, incorpora la observación resultante y determina si debe continuar o detenerse. La lógica exacta varía entre sistemas; el control puede combinar decisiones del modelo con reglas programadas, límites y validaciones externas.': '. An agent system adds a control cycle: it maintains task state, asks the model for a decision, executes a tool when appropriate, incorporates the resulting observation, and determines whether to continue or stop. The exact logic varies between systems; control can combine model decisions with programmed rules, limits, and external validations.',
    'Workflow determinista vs agente': 'Deterministic workflow vs agent',
    'En un': 'In a',
    'workflow': 'workflow',
    ', el orden de los pasos está definido en gran medida de antemano.': ', the order of the steps is largely defined in advance.',
    'sistema agente': 'agent system',
    ', al menos algunas decisiones sobre el siguiente paso se toman durante la ejecución según el estado y las observaciones. No es una frontera absoluta: muchos sistemas combinan flujos definidos, decisiones del modelo y reglas de control.': ', at least some decisions about the next step are made during execution according to state and observations. It is not an absolute boundary: many systems combine defined flows, model decisions, and control rules.',
    'Los cuatro componentes mínimos de un agente': 'The four minimum components of an agent',
    'Componentes frecuentes:': 'Common components:',
    'modelo · instrucciones y objetivo · estado/contexto · herramientas · bucle de control · criterios de evaluación y parada. La memoria persistente es útil en algunos agentes, pero no es obligatoria en todos.': 'model · instructions and goal · state/context · tools · control loop · evaluation and stopping criteria. Persistent memory is useful in some agents, but it is not required for all of them.',
    'Grados de autonomía': 'Degrees of autonomy',
    'La autonomía es gradual y depende de las tareas, herramientas y permisos disponibles. Un sistema puede limitarse a recomendar, pedir aprobación antes de actuar o ejecutar automáticamente ciertas acciones de bajo riesgo. Más autonomía no significa más fiabilidad: conviene definir permisos, límites, validaciones y puntos de intervención humana.': 'Autonomy is gradual and depends on the tasks, tools, and available permissions. A system may only recommend, ask for approval before acting, or automatically execute certain low-risk actions. More autonomy does not mean more reliability: define permissions, limits, validations, and points for human intervention.',
    'Demo · Una llamada vs un bucle': 'Demo · One call vs a loop',
    'Comparación en vivo: la misma pregunta resuelta con una única llamada a la API frente a un bucle de tres iteraciones.': 'Live comparison: the same question solved with a single API call versus a three-iteration loop.',
    'demo pendiente de implementar': 'demo pending implementation',
    'Aquí irá el panel comparativo: 1 llamada (contador de tokens) vs bucle de 3 pasos (estado creciendo en cada vuelta). Ver guion-agentes-ia.md, Módulo 1.': 'This is where the comparison panel will go: 1 call (token counter) vs a 3-step loop (state growing on each turn). See guion-agentes-ia.md, Module 1.',
    'Enunciado:': 'Task:',
    '«¿Cuál es la capital del país con más habitantes de Sudamérica y qué temperatura hace ahí ahora?»': '“What is the capital of the most populous country in South America, and what is the temperature there right now?”',
    'laboratorio pendiente de implementar': 'lab pending implementation',
    'El usuario prueba primero sin herramientas (falla o alucina el dato de temperatura), luego activa el "modo agente" y ve el bucle resolverlo en pasos.': 'The user first tries without tools (the model fails or hallucinates the temperature), then enables “agent mode” and watches the loop solve it step by step.',
    'Caso práctico transversal · Paso 1 de 5': 'Cross-cutting case study · Step 1 of 5',
    'Una incidencia: investigar una aplicación caída': 'An incident: investigating a down application',
    'Seguimos el mismo caso a lo largo del tutorial. El agente debe investigar una incidencia, utilizar herramientas con cuidado y verificar el resultado antes de detenerse.': 'We follow the same case throughout the tutorial. The agent must investigate an incident, use tools carefully, and verify the result before stopping.',
    'ETAPA 01 / 05': 'STAGE 01 / 05',
    'Definir el objetivo': 'Define the goal',
    'Investigar por qué una aplicación no responde y proponer una causa respaldada por evidencias.': 'Investigate why an application is not responding and propose an evidence-backed cause.',
    'Qué aprender:': 'What to learn:',
    'El agente separa el objetivo de una suposición: no debe afirmar que está resuelto hasta verificarlo.': 'The agent separates the goal from an assumption: it should not claim success until it has verified it.',
    'Siguiente: observar el bucle ReAct →': 'Next: observe the ReAct loop →',
    'Escenario didáctico simulado; no se conecta a servicios reales ni modifica sistemas externos.': 'Simulated teaching scenario; it does not connect to real services or modify external systems.',
    '← Anterior': '← Previous',
    'Módulo 02 · El bucle ReAct →': 'Module 02 · The ReAct loop →',
    'Módulo 01 de 05': 'Module 01 of 05',

    'El bucle ReAct: razonar y actuar': 'The ReAct loop: reason and act',
    'Cómo ReAct intercala razonamiento expresado, acciones y observaciones, y qué aporta este patrón —sin garantizar por sí solo decisiones correctas.': 'How ReAct interleaves expressed reasoning, actions, and observations, and what this pattern provides — without guaranteeing correct decisions by itself.',
    'De chain-of-thought a ReAct': 'From chain-of-thought to ReAct',
    'Chain-of-thought es una familia de técnicas que solicita pasos intermedios o razonamiento expresado. Puede ayudar en determinadas tareas, pero no garantiza una mayor precisión y el texto generado no siempre refleja fielmente los procesos internos del modelo. ReAct (Reasoning and Acting) combina razonamiento expresado con acciones y observaciones del entorno, de modo que el siguiente paso puede apoyarse en información obtenida durante la ejecución.': 'Chain-of-thought is a family of techniques that request intermediate steps or expressed reasoning. It can help with certain tasks, but it does not guarantee greater accuracy, and generated text does not always faithfully reflect the model’s internal processes. ReAct (Reasoning and Acting) combines expressed reasoning with actions and observations from the environment, so the next step can rely on information obtained during execution.',
    'El formato clásico': 'The classic format',
    'Thought: necesito saber X para responder Action: buscar_web("X") Observation: [resultado de la búsqueda] Thought: con este dato ya puedo calcular Y Action: calculadora("Y") Observation: [resultado] Thought: ya tengo todo lo necesario Final Answer: [respuesta compuesta]': 'Thought: I need to know X to answer Action: search_web("X") Observation: [search result] Thought: with this data I can calculate Y Action: calculator("Y") Observation: [result] Thought: I have everything I need Final Answer: [composed answer]',
    'Por qué funciona mejor que actuar directamente': 'Why it can work better than acting directly',
    'Una traza legible puede ayudar a inspeccionar qué información usó el sistema y qué acción intentó realizar. Sin embargo, explicar un plan no obliga a que sea correcto, ni una traza visible revela necesariamente todo el procesamiento interno. Para depurar con rigor, conviene registrar también las entradas y salidas de herramientas, errores, estado y resultados verificados.': 'A readable trace can help inspect what information the system used and what action it attempted. However, explaining a plan does not make it correct, nor does a visible trace necessarily reveal all internal processing. For rigorous debugging, it is also useful to record tool inputs and outputs, errors, state, and verified results.',
    'La traza como unidad de trabajo': 'The trace as a unit of work',
    'Una traza es el registro de los pasos de una ejecución: decisiones o mensajes relevantes, llamadas a herramientas, observaciones, errores y resultado final. Su contenido depende del sistema; no siempre incluye razonamiento privado ni debe asumirse que todo texto explicativo sea una descripción fiel del proceso interno. Las trazas ayudan a depurar y evaluar, respetando la privacidad y los datos sensibles.': 'A trace is the record of an execution’s steps: relevant decisions or messages, tool calls, observations, errors, and the final result. Its content depends on the system; it does not always include private reasoning, and explanatory text should not be assumed to faithfully describe internal processing. Traces help with debugging and evaluation while respecting privacy and sensitive data.',
    'Demo · Traza ReAct en vivo': 'Demo · Live ReAct trace',
    'Interfaz tipo terminal donde cada bloque (Thought, Action, Observation, Final Answer) aparece animado y coloreado por tipo.': 'Terminal-style interface where each block (Thought, Action, Observation, Final Answer) appears animated and color-coded by type.',
    'Ver guion-agentes-ia.md, Módulo 2, para el detalle de la animación paso a paso.': 'See guion-agentes-ia.md, Module 2, for the step-by-step animation details.',
    'una pregunta que combina un dato que hay que buscar con un cálculo posterior (p. ej. días hasta una fecha límite).': 'a question that combines a fact to look up with a subsequent calculation (e.g. days until a deadline).',
    'El usuario ve la traza completa generarse en vivo y puede reformular la pregunta para observar cómo cambia el razonamiento.': 'The user watches the full trace appear live and can rephrase the question to see how the reasoning changes.',
    'Caso práctico transversal · Paso 2 de 5': 'Cross-cutting case study · Step 2 of 5',
    'ETAPA 02 / 05': 'STAGE 02 / 05',
    'Observar y revisar hipótesis': 'Observe and review hypotheses',
    'El agente consulta el estado del servicio y observa que la aplicación devuelve un error 503.': 'The agent checks the service status and observes that the application returns a 503 error.',
    'La observación cambia el contexto. En lugar de inventar una causa, el agente decide qué comprobar a continuación.': 'The observation changes the context. Instead of inventing a cause, the agent decides what to check next.',
    'Siguiente: elegir una herramienta →': 'Next: choose a tool →',
    '← Módulo 01 · Fundamentos': '← Module 01 · Foundations',
    'Módulo 03 · Herramientas →': 'Module 03 · Tools →',
    'Módulo 02 de 05': 'Module 02 of 05',

    'Herramientas: cómo decide el modelo': 'Tools: how the model decides',
    'Tool schemas, function calling, y por qué la descripción de una herramienta pesa más que su implementación.': 'Tool schemas, function calling, and why a tool description matters more than its implementation.',
    'Qué es un tool schema': 'What is a tool schema',
    'Una herramienta se define con un nombre, una': 'A tool is defined by a name, a',
    'descripción': 'description',
    'en lenguaje natural — la parte que más influye en si el modelo la elige bien — y sus parámetros de entrada, normalmente como JSON Schema.': 'in natural language — the part that most influences whether the model chooses it correctly — and its input parameters, usually as JSON Schema.',
    'La mecánica real del function calling': 'The actual mechanics of function calling',
    'El modelo no ejecuta la herramienta. Devuelve una estructura pidiendo llamarla con ciertos argumentos; el código de la aplicación la ejecuta de verdad y le devuelve el resultado como una nueva Observation. El modelo nunca toca el mundo exterior directamente.': 'The model does not execute the tool. It returns a structure requesting the tool with certain arguments; the application code actually executes it and returns the result as a new Observation. The model never directly touches the outside world.',
    'Cómo "decide" el modelo qué herramienta usar': 'How the model “decides” which tool to use',
    'No hay un enrutador explícito. Dado el conjunto de herramientas disponibles y el historial, el modelo genera la salida más probable. Una descripción ambigua produce elecciones erróneas aunque la función esté bien programada; con muchas herramientas parecidas, la tasa de acierto baja.': 'There is no explicit router. Given the available tools and the history, the model generates the most likely output. An ambiguous description can produce wrong choices even when the function is well programmed; with many similar tools, the success rate drops.',
    'Cuando una herramienta falla': 'When a tool fails',
    'El error se devuelve al modelo como una Observation de error. El modelo puede razonar sobre ello y decidir reintentar, usar una alternativa, o informar de que no pudo completar la tarea.': 'The error is returned to the model as an error Observation. The model can reason about it and decide to retry, use an alternative, or report that it could not complete the task.',
    'Demo · ¿Qué herramienta elige el modelo?': 'Demo · Which tool does the model choose?',
    'Cuatro herramientas ficticias visibles con su descripción; al escribir una pregunta, se resalta la elegida junto con el fragmento de razonamiento que la justificó.': 'Four fictional tools are visible with their descriptions; when you type a question, the selected one is highlighted along with the reasoning fragment that justified it.',
    'Ver guion-agentes-ia.md, Módulo 3.': 'See guion-agentes-ia.md, Module 3.',
    'Reto:': 'Challenge:',
    'encontrar una pregunta ambigua que haga que el modelo elija mal una herramienta, y reescribirla para corregir la elección.': 'find an ambiguous question that makes the model choose the wrong tool, and rewrite it to correct the choice.',
    'El usuario prueba libremente preguntas contra el agente con las herramientas simuladas.': 'The user can freely test questions against the agent using the simulated tools.',
    'Caso práctico transversal · Paso 3 de 5': 'Cross-cutting case study · Step 3 of 5',
    'ETAPA 03 / 05': 'STAGE 03 / 05',
    'Elegir y ejecutar una herramienta': 'Choose and execute a tool',
    'Selecciona una herramienta de consulta de registros. La primera llamada falla porque falta un parámetro obligatorio.': 'Select a log-query tool. The first call fails because a required parameter is missing.',
    'El modelo solicita la herramienta; el programa la ejecuta y devuelve el error como observación. El agente puede corregir los argumentos o probar una alternativa.': 'The model requests the tool; the program executes it and returns the error as an observation. The agent can correct the arguments or try an alternative.',
    'Siguiente: revisar el plan y los límites →': 'Next: review the plan and limits →',
    '← Módulo 02 · El bucle ReAct': '← Module 02 · The ReAct loop',
    'Módulo 04 · Memoria →': 'Module 04 · Memory →',
    'Módulo 03 de 05': 'Module 03 of 05',

    'Memoria, planificación y criterio de parada': 'Memory, planning, and stopping criteria',
    'Qué recuerda un agente entre pasos, cómo descompone una tarea compleja, y por qué saber cuándo parar es la pieza de seguridad más importante.': 'What an agent remembers between steps, how it decomposes a complex task, and why knowing when to stop is the most important safety component.',
    'Memoria de corto plazo vs largo plazo': 'Short-term vs long-term memory',
    'El': 'The',
    'contexto de trabajo': 'working context',
    'reúne la información disponible durante una ejecución y está limitado por la ventana de contexto; las trazas más largas pueden aumentar el consumo y exigir selección o resumen. La': 'contains the information available during an execution and is limited by the context window; longer traces can increase usage and require selection or summarization. ',
    'memoria persistente': 'persistent memory',
    'conserva información entre ejecuciones mediante algún mecanismo de almacenamiento, como una base de datos o archivos.': 'keeps information between executions through some storage mechanism, such as a database or files.',
    'RAG': 'RAG',
    'es una técnica para recuperar información externa y añadirla al contexto, y puede usar una base vectorial, pero no es sinónimo de memoria a largo plazo ni es obligatoria en todos los sistemas.': 'is a technique for retrieving external information and adding it to the context. It can use a vector database, but it is not synonymous with long-term memory and is not required in every system.',
    'Planificación y descomposición de tareas': 'Planning and task decomposition',
    'Para algunas tareas complejas, generar un plan o descomponer el objetivo en subtareas puede mejorar la organización y facilitar la supervisión. No siempre es mejor planificarlo todo por adelantado: cuando el entorno cambia, un plan rígido puede quedar obsoleto. Los sistemas pueden alternar planificación, ejecución y revisión según las observaciones.': 'For some complex tasks, generating a plan or decomposing the goal into subtasks can improve organization and make supervision easier. Planning everything in advance is not always better: when the environment changes, a rigid plan can become obsolete. Systems can alternate planning, execution, and review based on observations.',
    'El problema del criterio de parada': 'The stopping-criteria problem',
    'La finalización debe definirse con criterios observables, por ejemplo, una condición de éxito verificada, una respuesta terminal válida o la necesidad de intervención humana. La señal del modelo puede formar parte de la decisión, pero no basta en todos los casos: el agente puede declarar éxito prematuramente, repetir acciones o no progresar. Conviene combinar evaluación del resultado con límites externos.': 'Completion should be defined by observable criteria, such as a verified success condition, a valid terminal response, or the need for human intervention. The model signal can be part of the decision, but it is not enough in every case: the agent may declare success prematurely, repeat actions, or make no progress. It is better to combine outcome evaluation with external limits.',
    'Salvaguardas de producción': 'Production safeguards',
    ', timeouts, presupuesto máximo de tokens o coste por tarea, y human-in-the-loop en los puntos de mayor riesgo.': ', timeouts, a maximum token or per-task cost budget, and human-in-the-loop at the highest-risk points.',
    'Demo · Árbol de planificación con límite de iteraciones': 'Demo · Planning tree with an iteration limit',
    'Un objetivo se descompone en subtareas que se completan en tiempo real, junto a una barra de "iteraciones usadas / máximo permitido".': 'A goal is decomposed into subtasks that are completed in real time, alongside a bar showing “iterations used / maximum allowed”.',
    'Ver guion-agentes-ia.md, Módulo 4.': 'See guion-agentes-ia.md, Module 4.',
    '«organiza esta lista de 5 datos en una tabla y saca una conclusión», con límite de iteraciones ajustable por el usuario.': '“organize this list of 5 data points into a table and draw a conclusion”, with an iteration limit adjustable by the user.',
    'Si el límite se fija demasiado bajo, el agente se corta a mitad de tarea con un mensaje explicativo.': 'If the limit is set too low, the agent stops halfway through the task with an explanatory message.',
    'Caso práctico transversal · Paso 4 de 5': 'Cross-cutting case study · Step 4 of 5',
    'ETAPA 04 / 05': 'STAGE 04 / 05',
    'Adaptar el plan y verificar': 'Adapt the plan and verify',
    'Con los registros encuentra un límite de conexiones. Tras aplicar una corrección autorizada en el entorno simulado, vuelve a comprobar el estado.': 'The logs reveal a connection limit. After applying an authorized fix in the simulated environment, it checks the status again.',
    'La acción no equivale a éxito. La verificación externa determina si el objetivo se ha cumplido; si no, el bucle continúa o pide ayuda.': 'Taking an action is not the same as success. External verification determines whether the goal has been met; if not, the loop continues or asks for help.',
    'Siguiente: panorama y conclusiones →': 'Next: overview and conclusions →',
    '← Módulo 03 · Herramientas': '← Module 03 · Tools',
    'Módulo 05 · Panorama →': 'Module 05 · Overview →',
    'Módulo 04 de 05': 'Module 04 of 05',

    'Panorama de la industria': 'Industry overview',
    'Dónde encajan los frameworks reales, y qué lecciones históricas existen sobre autonomía sin control.': 'Where real frameworks fit, and what historical lessons exist about autonomy without control.',
    'Frameworks reales': 'Real frameworks',
    'LangChain / LangGraph como orquestadores populares para construir bucles de agentes; el Claude Agent SDK como ejemplo de SDK oficial pensado específicamente para este patrón. La propia Anthropic formalizó la distinción entre': 'LangChain / LangGraph as popular orchestrators for building agent loops; the Claude Agent SDK as an example of an official SDK designed specifically for this pattern. Anthropic itself formalized the distinction between',
    'que abrió el Módulo 1 en un artículo de ingeniería de referencia — primer enlace de la lista de abajo.': 'which opened Module 1 in a reference engineering article — the first link in the list below.',
    'AutoGPT como caso histórico': 'AutoGPT as a historical case',
    'Uno de los primeros intentos populares (2023) de "agente totalmente autónomo", sin un criterio de parada robusto ni supervisión — un buen ejemplo real de por qué el Módulo 4 importa tanto en la práctica.': 'One of the first popular attempts (2023) at a “fully autonomous agent”, without a robust stopping criterion or supervision — a real example of why Module 4 matters so much in practice.',
    'Multi-agente': 'Multi-agent',
    'Cuándo tiene sentido dividir el trabajo entre varios agentes especializados que se coordinan (uno planifica, otro ejecuta, otro revisa) en lugar de un único agente generalista.': 'When it makes sense to split work among several specialized agents that coordinate (one plans, another executes, another reviews) instead of using a single generalist agent.',
    'Para seguir explorando': 'Explore further',
    'Este módulo de cierre no incluye demo ni laboratorio — son las referencias para quien quiera seguir después del tutorial.': 'This closing module has no demo or lab — these references are for anyone who wants to continue after the tutorial.',
    'anthropic.com · artículo de ingeniería': 'anthropic.com · engineering article',
    'El propio artículo de Anthropic que formaliza la distinción entre workflow (pasos fijados de antemano) y agente (el modelo decide el siguiente paso) — la idea que abre el Módulo 1 de este tutorial.': 'Anthropic’s article that formalizes the distinction between workflow (steps fixed in advance) and agent (the model decides the next step) — the idea that opens Module 1 of this tutorial.',
    'docs.langchain.com · documentación oficial': 'docs.langchain.com · official documentation',
    'Framework de orquestación que modela un agente como un grafo con estado: nodos, transiciones condicionales y puntos de persistencia para pausar y reanudar.': 'An orchestration framework that models an agent as a stateful graph: nodes, conditional transitions, and persistence points for pausing and resuming.',
    'platform.claude.com · documentación oficial': 'platform.claude.com · official documentation',
    'El SDK con el que Anthropic construye Claude Code: mismo bucle de agente, herramientas y gestión de contexto, expuesto como librería para Python y TypeScript.': 'The SDK Anthropic uses to build Claude Code: the same agent loop, tools, and context management exposed as a Python and TypeScript library.',
    'en.wikipedia.org · resumen histórico': 'en.wikipedia.org · historical summary',
    'Contexto del caso citado en el Módulo 4: por qué un agente sin criterio de parada robusto cae en bucles infinitos, y cómo evolucionó el proyecto después de 2023.': 'Context for the case cited in Module 4: why an agent without a robust stopping criterion can fall into infinite loops, and how the project evolved after 2023.',
    'Caso práctico transversal · Paso 5 de 5': 'Cross-cutting case study · Step 5 of 5',
    'ETAPA 05 / 05': 'STAGE 05 / 05',
    'Extraer la lección': 'Extract the lesson',
    'El servicio responde correctamente después de la corrección y una comprobación final confirma el resultado.': 'The service responds correctly after the fix, and a final check confirms the result.',
    'El agente se detiene porque se cumple un criterio observable, no simplemente porque el modelo haya dicho «terminado».': 'The agent stops because an observable criterion is met, not simply because the model said “done”.',
    'Volver al inicio →': 'Back to home →',
    '← Módulo 04 · Memoria': '← Module 04 · Memory',
    'Fin': 'End',
    'Módulo 05 de 05 · Bonus': 'Module 05 of 05 · Bonus',
    'Introducción a Agentes de IA — Bucles de decisión autónomos': 'Introduction to AI Agents — Autonomous decision loops',
    'Módulo 1 · Fundamentos — Agentes de IA': 'Module 1 · Foundations — AI Agents',
    'Módulo 2 · El bucle ReAct — Agentes de IA': 'Module 2 · The ReAct loop — AI Agents',
    'Módulo 3 · Herramientas — Agentes de IA': 'Module 3 · Tools — AI Agents',
    'Módulo 4 · Memoria y criterio de parada — Agentes de IA': 'Module 4 · Memory and stopping criteria — AI Agents',
    'Módulo 5 · Panorama de la industria — Agentes de IA': 'Module 5 · Industry overview — AI Agents',
    'Un tutorial práctico sobre cómo un LLM pasa de responder a decidir: bucles de razonamiento, herramientas, memoria y planificación.': 'A practical tutorial on how an LLM moves from answering to deciding: reasoning loops, tools, memory, and planning.',

    // Module 1 dynamic UI
    '¿Qué temperatura hace ahora mismo en Tokio?': 'What is the temperature in Tokyo right now?',
    'Respuesta': 'Answer',
    'No tengo acceso a datos en tiempo real, pero en septiembre Tokio suele rondar los 26 °C.': 'I do not have access to real-time data, but in September Tokyo is usually around 26 °C.',
    'Necesito el dato real de temperatura, no lo tengo.': 'I need the actual temperature; I do not have it.',
    'Ya tengo el dato real, puedo responder.': 'I have the actual data now; I can answer.',
    'Ahora mismo en Tokio hace 29 °C.': 'It is 29 °C in Tokyo right now.',
    'Una sola llamada': 'Single call',
    'Bucle de decisión (Pensar → Actuar → Observar)': 'Decision loop (Think → Act → Observe)',
    'Pausar': 'Pause',
    'Reproducir automático': 'Auto play',
    'Siguiente paso': 'Next step',
    'Reiniciar': 'Reset',
    'Esperando ejecución.': 'Waiting for execution.',
    'Llamadas:': 'Calls:',
    'Tokens acumulados:': 'Accumulated tokens:',
    '¿Cuál es la capital del país con más habitantes de Sudamérica y qué temperatura hace ahí ahora?': 'What is the capital of the most populous country in South America, and what is the temperature there right now?',
    'La capital de Brasil es Brasilia. No tengo datos en tiempo real, pero suele rondar los 24 °C en esta época.': 'The capital of Brazil is Brasilia. I do not have real-time data, but it is usually around 24 °C at this time of year.',
    'Necesito identificar el país con más habitantes de Sudamérica.': 'I need to identify the most populous country in South America.',
    'Brasil es el país con más población de Sudamérica.': 'Brazil is the most populous country in South America.',
    'Ahora necesito la capital de Brasil.': 'Now I need Brazil’s capital.',
    'La capital de Brasil es Brasilia.': 'Brazil’s capital is Brasilia.',
    'Con la ciudad identificada, consulto la temperatura real.': 'Now that I have the city, I will check the actual temperature.',
    '22 °C, parcialmente nublado.': '22 °C, partly cloudy.',
    'Ya tengo todos los datos verificados.': 'I have all the data verified.',
    'La capital de Brasil es Brasilia, y ahora mismo hace 22 °C.': 'Brazil’s capital is Brasilia, and it is 22 °C there right now.',
    'Sin herramientas': 'No tools',
    'Modo agente': 'Agent mode',
    'Pregunta:': 'Question:',
    'Pensando… (llamando a la API real)': 'Thinking… (calling the real API)',
    'Elegida por Groq': 'Chosen by Groq',
    'Puntuación:': 'Score:',
    'Ejecutar': 'Run',
    'Escribe una pregunta…': 'Type a question…',
    'Pregunta para el selector de herramientas': 'Question for the tool selector',
    'Configurar API real': 'Configure real API',
    'Ocultar configuración': 'Hide configuration',
    'API key de Groq': 'Groq API key',
    'Modelo de Groq': 'Groq model',
    'Guardar': 'Save',
    'Quitar': 'Clear',
    'La clave de Groq se guarda solo en este navegador (localStorage) y se envía directamente a Groq. No la incluyas nunca en el repositorio.': 'The Groq key is stored only in this browser (localStorage) and sent directly to Groq. Never include it in the repository.',
    'Modo: simulación local — añade una API key de Groq para activar el modelo real': 'Mode: local simulation — add a Groq API key to enable the real model',
    'Modo: Groq': 'Mode: Groq',
    'API key configurada en este navegador': 'API key configured in this browser',
    'No se pudo contactar con Groq': 'Could not contact Groq',
    'Mostrando la simulación en su lugar.': 'Showing the simulation instead.',
    'límite de peticiones alcanzado': 'request limit reached',
    'origen no permitido por el backend': 'origin not allowed by the backend',
    'error del servidor': 'server error',
    'respuesta inesperada': 'unexpected response',
    'sin conexión o URL incorrecta': 'no connection or incorrect URL',
    'Ninguna herramienta encaja con claridad — respondería directamente, sin usar herramientas.': 'No tool is a clear match — it would answer directly without using tools.',
    'Pensando…': 'Thinking…',

    'Busca información actualizada en internet sobre un tema.': 'Searches the internet for up-to-date information about a topic.',
    'Realiza cálculos numéricos: sumas, restas, porcentajes, conversiones.': 'Performs numerical calculations: sums, subtractions, percentages, conversions.',
    'Consulta datos internos: clientes, pedidos, ventas, inventario.': 'Queries internal data: customers, orders, sales, inventory.',
    'Traduce texto entre distintos idiomas.': 'Translates text between different languages.',
    'Qué buscar': 'What to search for',
    'La operación a resolver': 'Operation to solve',
    'Qué dato interno consultar': 'Internal data to query',
    'Texto a traducir': 'Text to translate',
    'Idioma de destino': 'Target language',
    '¿Qué tiempo hace en Madrid?': 'What is the weather like in Madrid?',
    '¿Cuánto es el 15% de 240?': 'What is 15% of 240?',
    "Traduce 'buenos días' al inglés": "Translate 'good morning' into English",
    '¿Cuántos pedidos tiene cada cliente este mes?': 'How many orders does each customer have this month?',
    '¿Cuánto tiempo hace que no llueve en Madrid?': 'How long has it been since it rained in Madrid?',

    // Module 2 dynamic UI
    'trace player': 'trace player',
    'next step': 'next step',
    'auto play': 'auto play',
    'reset': 'reset',
    'Next steps': 'Next steps',
    '¿Cuántos días faltan desde hoy (21 de octubre de 2026) hasta el 25 de diciembre de 2026?': 'How many days are left from today (October 21, 2026) until December 25, 2026?',
    'Necesito conocer la fecha de hoy y la fecha objetivo para calcular la diferencia.': 'I need today’s date and the target date to calculate the difference.',
    'Hoy es 21 de octubre de 2026.': 'Today is October 21, 2026.',
    'Ya tengo ambas fechas. Puedo calcular la diferencia en días.': 'I have both dates. I can calculate the difference in days.',
    '65 días.': '65 days.',
    'Ya tengo todo lo necesario para responder.': 'I have everything I need to answer.',
    'Faltan 65 días para el 25 de diciembre de 2026.': 'There are 65 days left until December 25, 2026.',
    '¿Cuántos días faltan hasta el 25 de diciembre?': 'How many days are left until December 25?',
    'El usuario no ha indicado la fecha de hoy. Necesito consultarla antes de nada.': 'The user has not provided today’s date. I need to look it up first.',
    'Tampoco se ha indicado el año del 15 de diciembre; asumiré el año en tutorial, 2026.': 'The year of December 15 has not been specified either; I will assume the tutorial year, 2026.',
    'Faltan 65 días para el 15 de diciembre (asumiendo 2026).': 'There are 65 days left until December 15 (assuming 2026).',
    '¿Cuántos días faltan desde hoy hasta el 25 de diciembre de 2026?': 'How many days are left from today until December 25, 2026?',
    'Necesito la fecha de hoy; el año del objetivo ya está indicado.': 'I need today’s date; the target year is already specified.',
    'Ya tengo ambas fechas completas.': 'I have both dates.',
    'Todo listo para responder.': 'Everything is ready to answer.',
    'La fecha límite es el 25 de diciembre de 2026. ¿Cuántos días faltan desde el 21 de octubre de 2026?': 'The deadline is December 25, 2026. How many days are left from October 21, 2026?',
    'El usuario ya me ha dado las dos fechas completas; no necesito buscar nada.': 'The user has already given me both complete dates; I do not need to look anything up.',
    'Con este único cálculo ya puedo responder.': 'With this single calculation I can answer.',
    'Faltan 65 días.': 'There are 65 days left.',
    'Thought': 'Thought',
    'Action': 'Action',
    'Observation': 'Observation',
    'Final Answer': 'Final Answer',

    // Module 4 dynamic UI
    'Iteraciones usadas': 'Iterations used',
    'Iteraciones:': 'Iterations:',
    'Límite:': 'Limit:',
    'Ejecutar plan': 'Run plan',
    'Objetivo:': 'Goal:',
    'Tarea:': 'Task:',
    'Plan completado': 'Plan completed',
    'Límite de iteraciones alcanzado': 'Iteration limit reached',
    'Ejecución cortada de forma controlada: así se evita un bucle sin fin, aunque la tarea quede incompleta.': 'Execution was stopped in a controlled way: this prevents an endless loop even if the task remains incomplete.',
    'iteraciones disponibles.': 'iterations available.',
    'Aumentar límite a': 'Increase limit to',
    'y reintentar': 'and retry',
    'Resumir la temperatura en 3 ciudades y calcular la media': 'Summarize the temperature in 3 cities and calculate the average',
    'Consultar temperatura en Madrid': 'Check the temperature in Madrid',
    'Consultar temperatura en Tokio': 'Check the temperature in Tokyo',
    'Consultar temperatura en Bogotá': 'Check the temperature in Bogotá',
    'Calcular la media y redactar la conclusión': 'Calculate the average and write the conclusion',
    'Organizar 5 datos de ventas mensuales en una tabla y sacar una conclusión': 'Organize 5 monthly sales data points into a table and draw a conclusion',
    'Leer y validar los 5 datos (Ene 120, Feb 98, Mar 143, Abr 110, May 156)': 'Read and validate the 5 data points (Jan 120, Feb 98, Mar 143, Apr 110, May 156)',
    'Construir la tabla mes → unidades vendidas': 'Build the month → units sold table',
    'Calcular la tendencia (creciente / decreciente)': 'Calculate the trend (increasing / decreasing)',
    'Redactar la conclusión final': 'Write the final conclusion',
    'Fija el límite de iteraciones antes de ejecutar.': 'Set the iteration limit before running.',
  };

  const attrNames = ['aria-label', 'aria-description', 'placeholder', 'title', 'alt'];

  function translateString(value) {
    if (!value || typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (Object.prototype.hasOwnProperty.call(translations, trimmed)) {
      const leading = value.slice(0, value.indexOf(trimmed));
      const trailing = value.slice(value.indexOf(trimmed) + trimmed.length);
      return leading + translations[trimmed] + trailing;
    }

    // Common dynamic/template strings.
    let out = value;
    out = out.replace(/^Pregunta:\s*“/, 'Question: “')
      .replace(/^Objetivo:\s*“/, 'Goal: “')
      .replace(/^Tarea:\s*“/, 'Task: “')
      .replace(/^Límite:\s*/, 'Limit: ')
      .replace(/^Iteraciones:\s*/, 'Iterations: ')
      .replace(/^Llamadas:\s*/, 'Calls: ')
      .replace(/·\s*Tokens acumulados:/g, '· Accumulated tokens:')
      .replace(/^Puntuación:\s*/g, 'Score: ')
      .replace(/^No se pudo contactar con Groq\s*\(/, 'Could not contact Groq (')
      .replace(/\)\.\s*Mostrando la simulación en su lugar\./g, '). Showing the simulation instead.')
      .replace(/^Modo:\s*simulación local\s*—/g, 'Mode: local simulation —')
      .replace(/API key configurada en este navegador/g, 'API key configured in this browser')
      .replace(/añade una API key de Groq para activar el modelo real/g, 'add a Groq API key to enable the real model')
      .replace(/Elegida por Groq/g, 'Chosen by Groq')
      .replace(/Pensando…/g, 'Thinking…')
      .replace(/llamando a la API real/g, 'calling the real API')
      .replace(/Ninguna herramienta encaja con claridad/g, 'No tool is a clear match')
      .replace(/respondería directamente, sin usar herramientas/g, 'it would answer directly without using tools');
    return out;
  }

  function translateNode(root, language) {
    if (language !== 'en') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) continue;
      if (node.parentElement.closest('.site-header__title')) continue;
      nodes.push(node);
    }
    nodes.forEach((node) => {
      if (!node.__i18nOriginal) node.__i18nOriginal = node.nodeValue;
      node.nodeValue = translateString(node.__i18nOriginal);
    });

    root.querySelectorAll?.('*').forEach((el) => {
      attrNames.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          if (!el.__i18nAttrs) el.__i18nAttrs = {};
          if (!el.__i18nAttrs[attr]) el.__i18nAttrs[attr] = el.getAttribute(attr);
          el.setAttribute(attr, translateString(el.__i18nAttrs[attr]));
        }
      });
    });
  }

  function restoreNode(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.__i18nOriginal != null) node.nodeValue = node.__i18nOriginal;
    }
    root.querySelectorAll?.('*').forEach((el) => {
      if (!el.__i18nAttrs) return;
      Object.entries(el.__i18nAttrs).forEach(([attr, value]) => el.setAttribute(attr, value));
    });
  }

  function setLanguage(language) {
    const lang = language === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.dataset.language = lang;
    document.querySelectorAll('.site-header__title').forEach((brand) => {
      brand.innerHTML = lang === 'en' ? '<span>AI</span> Agents' : 'Agentes de <span>IA</span>';
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    document.querySelectorAll('[data-i18n-language-toggle]').forEach((button) => {
      button.textContent = lang === 'en' ? 'Español' : 'English';
      button.setAttribute('aria-label', lang === 'en' ? 'Switch to Spanish' : 'Switch to English');
      button.setAttribute('title', lang === 'en' ? 'Switch to Spanish' : 'Switch to English');
    });
    if (lang === 'en') translateNode(document.body, 'en');
    else restoreNode(document.body);
    const title = document.querySelector('title');
    if (title) {
      if (!title.__i18nOriginal) title.__i18nOriginal = title.textContent;
      title.textContent = lang === 'en' ? translateString(title.__i18nOriginal) : title.__i18nOriginal;
    }
    document.querySelectorAll('meta[name="description"]').forEach((meta) => {
      if (!meta.__i18nOriginal) meta.__i18nOriginal = meta.getAttribute('content') || '';
      meta.setAttribute('content', lang === 'en' ? translateString(meta.__i18nOriginal) : meta.__i18nOriginal);
    });
    // Dynamic module widgets can have been rendered before the toggle.
    if (lang === 'en') translateNode(document.body, 'en');
  }

  function init() {
    const headerButtons = document.querySelectorAll('[data-i18n-language-toggle]');
    if (!headerButtons.length) return;
    const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return 'es'; } })() || 'es';
    headerButtons.forEach((button) => {
      button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'es' : 'en'));
    });
    setLanguage(saved);
    // Reveal the page only after the saved language has been applied, avoiding a Spanish/English flash.
    document.documentElement.classList.add('i18n-ready');
    const observer = new MutationObserver((mutations) => {
      if (document.documentElement.lang !== 'en') return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            translateNode(node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement, 'en');
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
