# Título de la Prueba Técnica: "El Asistente de Viajes"

Prueba técnica para [Sherpa.wtf](https://www.sherpa.wtf/) sobre un bot asistente de viajes que ayude al usuario con la planificación de un viaje. El bot debe ser capaz de sugerir lugares turíticos según el destino especificado, generar una lista básica de cosas para llevar según el destino y duración del viaje, entre otros requisitos detallados a continuación. 

## Índice
- [Requerimientos Obligatorios](#requerimientos-obligatorios)
- [Instalación](#instalación)
- [Ejemplo de Uso](#ejemplo-de-uso)
- [Decisiones técnicas y Desafíos encontrados](#decisiones-técnicas-y-desafíos-encontrados)
- [Propuestas o ideas adicionales](#propuestas-o-ideas-adicionales)
- [Valoración personal del desafío](#valoración-personal-del-desafío)

## Requerimientos Obligatorios
1. Flujo Multi-Agente:
- Implementa al menos 2 agentes que trabajen en conjunto.
  - Agente 1: Experto en destinos (sugerencias, lugares populares, etc.).
  - Agente 2: Especialista en equipaje y clima.
2. Funcionalidades del Bot:
- Búsqueda de destinos: Permite al usuario explorar destinos con detalles básicos (nombre, ubicación, y una descripción breve).
- Sugerencias para empacar: Según el destino y la duración del viaje, el bot debe generar una lista básica de cosas para llevar.
- Consulta de clima: Obtener información del clima utilizando una API pública gratuita (por ejemplo, OpenWeatherMap) para el destino y la fecha proporcionados.
3. Manejo de Conversaciones:
- El bot debe ser capaz de gestionar hilos de conversación, permitiendo al usuario:
  - Cambiar de tema (por ejemplo, de destinos a clima) sin perder el contexto.
  - Retomar un hilo anterior.
4. Tecnologías y Librerías:
- TypeScript: Para todo el desarrollo.
- LangGraph: Para la lógica de agentes y flujos conversacionales.
5. Exposición Local:
- Crea una ruta HTTP en Express.js donde se pueda probar el bot localmente.
- Ejemplo: Un endpoint /api/chat que acepte un input JSON simulando una conversación y devuelva una respuesta.

## Instalación
### Requisitos
- Node.js v20.18.2
- npm v10.8.2
- API Key de OpenAI, TavilyAI y OpenWeatherMap
- curl o Postman para realizar solicitudes HTTP

### Instalación
1. Clona el repositorio
```bash
git clone https://github.com/facurodrij/chatbot-travel.git
```
2. Instala las dependencias
```bash
npm install
```
3. Inicia el servidor
```bash
npm start
```
4. Ingresa las API Keys solicitadas por consola como el siguiente ejemplo:
```bash
Please enter your OpenAI API Key:sk-proj-uWHqZ...
```
5. El servidor estará disponible en `http://localhost:3000`

## Ejemplo de Uso
1. Para probar el bot, puedes utilizar `curl` para enviar solicitudes POST a la ruta `/api/chat` con el siguiente formato:

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "Hola, quiero ir de vacaciones a Florianopolis, Brasil. ¿Qué lugares debería visitar?"}'
```
2. En la terminal, recibirás la respuesta del bot.
3. Para continuar la conversación siguiendo el hilo, te doy los siguientes ejemplos:
```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "Quiero ir el 8 de febrero de 2025. ¿Cómo estará el clima y qué debo empacar?"}'
```
```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "Mi presupuesto es de R$2000 y quiero quedarme 7 días"}'
```

### Ejecutar Pruebas (Opcional)
Para obtener más información del modelo y obtener las respuestas completas del bot, puedes ejecutar las pruebas creadas con el siguiente comando:

**Apagar el servidor antes de ejecutar las pruebas**
```bash
npm test
```

## Decisiones técnicas y Desafíos encontrados
### Decisiones
- Se utilizo TypeScript para todo el desarrollo.
- Se utilizo el framework Express.js para la creación del servidor HTTP.
- Se utilizo LangGraph para la lógica de agentes y flujos conversacionales.
- Se creo una estructura multi-agente con dos agentes: `DestinationAgent` y `PackingAgent`.
- Se opto por utilizar la estructura `Multi-agent supervisor`, donde un agente supervisor es el encargado de gestionar la conversación y seleccionar el agente adecuado para responder, mas info en [LangGraph Multi-agent supervisor](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/).
- Se utilizan las APIs de `OpenAI`, `TavilyAI` y `OpenWeatherMap`:
  - OpenAI: Para la generación de respuestas de texto.
  - Tavily: Para la busqueda en internet y generación de respuestas.
  - OpenWeatherMap: Para la consulta del clima en el destino proporcionado.

### Desafíos
- Es mi primera vez utilizando las librerías LangChain y LangGraph, por lo que tuve que aprender a utilizarlas leyendo su documentación y entender su funcionamiento mediante ejemplos.
- La creación de agentes y la estructura de flujos conversacionales fue un desafío, ya que tuve que pensar en cómo organizar la lógica de los agentes y cómo gestionar la conversación entre ellos.
- La creación de la herramienta que integra la API de OpenWeatherMap fue un desafío importante, ya que en la versión gratuita no se puede consultar el clima de una fecha específica, solamente devuelve el clima actual o hasta un máximo de 5 días en el futuro. Por lo que tuve que adaptar al agente con esta limitación.
- Entender los conceptos de la librería LangGraph como Memorias, Tools, Graphs, ChatPromptTemplates, entre otros, fue un desafío, ya que es una librería muy completa y con muchas funcionalidades. Soy consciente de que aún me falta mucho por aprender y explorar de esta librería.
- Me pareción interesante que en algunos puntos he notado que la documentación de LangGraph en Python se encuentran mejores explicaciones que en la documentación de JavaScript. O probablemente sea que me siento más cómodo con Python.

### Mejoras Implementadas
1. Personalización del Presupuesto:
    - Permite al usuario ingresar un presupuesto y sugiere actividades o lugares dentro de ese rango.


## Propuestas o ideas adicionales
- Implementación de un agente con integración a la API de Google Calendar para la planificación de itinerarios.
- Implementación de un agente con capacidad de recomendaciones de seguridad y salud en el destino, como lugares inseguros, medios de transporte recomendados, precauciones con la comida y bebida, entre otros.
- Implementación de un agente con integración a la API de Google Maps para la generación de ruta recomendada y estimación de tiempo de viaje.


## Valoración personal del desafío
Me gustaría agradecer a la empresa por la oportunidad de participar en este desafío técnico. Ha sido una experiencia muy enriquecedora y desafiante, ya que me ha permitido aprender nuevas tecnologías y conceptos, y me ha motivado a seguir explorando y mejorando mis habilidades en el desarrollo de chatbots y agentes conversacionales dado que es un campo absultamente nuevo para mi. A pesar de los desafíos encontrados, me siento satisfecho con el resultado obtenido y con las mejoras implementadas. Estoy seguro de que este desafío me ha ayudado a crecer como desarrollador y a adquirir nuevas habilidades que me serán útiles en futuros proyectos. Estaría enormemente agradecido por su feedback y comentarios sobre mi solución.
