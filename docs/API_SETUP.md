# Conectar el laboratorio del Módulo 3 a Groq

Por defecto, el laboratorio del Módulo 3 funciona con una simulación local
(coincidencia de palabras clave): cero coste, cero configuración y disponible
para cualquiera que abra la web. El laboratorio puede pasar opcionalmente al
modo real usando una API key personal de **Groq**.

## 1. Groq: API key personal

El laboratorio permite introducir una API key de Groq desde **"⚙ Configurar API real"**.
La clave se guarda únicamente en el `localStorage` del navegador y la llamada
se realiza directamente contra la API de Groq. La clave no se escribe en los
archivos del proyecto ni en el repositorio.

Para usarlo:

1. Crea una API key en GroqCloud.
2. En el Módulo 3, abre **"⚙ Configurar API real"**.
3. Introduce la clave `gsk_...`.
4. Deja `openai/gpt-oss-120b` como modelo recomendado o escribe otro
   modelo de Groq compatible con tool use.
5. Pulsa **Guardar** y ejecuta una pregunta.

Groq soporta *function/tool calling* mediante el parámetro `tools` y su API
de chat. El laboratorio utiliza las mismas cuatro herramientas de la
simulación:

- `buscador_web`
- `calculadora`
- `base_de_datos_interna`
- `traductor`

El modelo decide qué herramienta debería utilizar, pero las herramientas no
se ejecutan realmente. El objetivo es visualizar la decisión del agente.

## 2. Seguridad de la API key

Esta modalidad está pensada para que una persona use su propia clave en su
propio navegador. Una API key almacenada en `localStorage` no es un secreto
de producción: cualquier persona con acceso al navegador podría verla.

Por tanto:

- No introduzcas una clave de otra persona.
- No publiques una clave en HTML, JavaScript, commits, issues o documentación.
- No incluyas una clave real en `.env`, `wrangler.toml` ni ningún archivo que
  vaya a subir al repositorio.
- Si publicas la aplicación, informa al usuario de que la llamada se realiza
  directamente desde su navegador a Groq y que utiliza su propia cuota.

Para una aplicación de producción con una clave compartida por todos los
usuarios, sería preferible interponer un backend seguro que almacene la clave
como secreto y aplique autenticación y rate limiting.

## 3. Funcionamiento del laboratorio

Cuando existe una API key guardada, cada pregunta del laboratorio se envía a
Groq. La tarjeta resaltada representa la herramienta que el modelo eligió.

Si Groq no responde, la aplicación muestra el error y vuelve automáticamente
a la simulación local. La página nunca depende de que la API esté disponible.

La API key y el modelo se guardan en `localStorage` del navegador de quien
los configura. Cada visitante que quiera utilizar el modo real debe
proporcionar su propia clave.

## 4. Probar localmente

Puedes ejecutar el sitio sin ningún servidor backend:

```bash
npm run dev
```

Después abre el Módulo 3 y utiliza **"⚙ Configurar API real"** para introducir
tu clave de Groq.

## 5. Coste

La aplicación no realiza llamadas reales mientras no se configure una API
key. Una vez configurada, cada ejecución del laboratorio consume la cuota
del proyecto de Groq asociada a la clave introducida por el usuario.
