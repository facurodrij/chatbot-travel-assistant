# Desafío de Habilidades para el Rol de Dev Jr en Sherpa.wtf
### Título de la Prueba Técnica: "El Asistente de Viajes"

## Stack Tecnologico utilizado en la empresa

- TypeScript
- Node.js
- Express.js

Librerías usadas:
- LangGraph
- LangChain
- BuilderBot

## Contexto
Un cliente (Juan)  desea lanzar un asistente digital básico para planificar viajes. El cliente quiere comenzar con una versión sencilla pero funcional que pueda ser escalada en el futuro. Tu misión es crear un prototipo de este asistente utilizando las tecnologías y librerías clave de Sherpa.
El desafío está diseñado para que puedas resolverlo con habilidades básicas, pero incluye espacio para que amplíes y explores soluciones más avanzadas si lo deseas. ¡Sorprender con soluciones creativas y funcionalidades adicionales siempre será bienvenido!


## Objetivo
Crear un bot que asista a los usuarios en la planificación de un viaje, proporcionando información básica y funcionalidades mínimas, con el potencial de escalar a una herramienta más completa.

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

## Nice to Have (Opcional)
Si quieres llevar el desafío un paso más allá, puedes implementar alguna de las siguientes mejoras:
1. Integración con APIs de Vuelos o Alojamiento:
- Busca vuelos u hoteles en el destino usando una API externa (como Skyscanner, Amadeus o Booking).
2. Personalización del Presupuesto:
- Permite al usuario ingresar un presupuesto y sugiere actividades o lugares dentro de ese rango.
3. Planificación Avanzada:
- Crea un itinerario diario básico para el usuario, considerando el destino y la duración del viaje.
4. Documentación y Buenas Prácticas:
- Genera una breve guía en el README.md explicando cómo correr, probar, y ampliar la funcionalidad del bot.

## Criterios de Evaluación
1. Capacidad de Resolución:
- Implementación de las funcionalidades mínimas requeridas.
- Eficiencia en el uso de TypeScript y LangGraph.
2. Estructura del Proyecto:
- Código modular y bien organizado.
- Buenas prácticas de programación (nombres descriptivos, comentarios, etc.).
3. Creatividad y Expansión:
- Funcionalidades opcionales implementadas.
- Propuestas o ideas adicionales para escalar la solución.
4. Documentación:
- Explicación clara del proyecto y cómo ejecutarlo.
- Detalles sobre decisiones técnicas o desafíos encontrados.

## Instrucciones de Entrega
1. Setup Inicial:
- Crea un repositorio en GitHub o entrega el proyecto comprimido con instrucciones claras.
2. Entrega Básica:
- Asegúrate de que el bot cumpla con los requerimientos obligatorios.
- Expón el endpoint /api/chat y proporciona ejemplos de inputs y outputs.
3. Extras Opcionales:
- Si implementaste funcionalidades adicionales, explica cómo probarlas y por qué las consideraste valiosas.
4. Deadline:
- Completa el desafío en un plazo de 7 días desde su recepción.

## Relato de la Prueba
Imagina que un cliente se acerca a Sherpa con una necesidad urgente:

"Quiero un asistente de viajes sencillo, algo funcional que pueda ayudar a las personas a planificar viajes sin complicaciones. Necesito que sea ágil, fácil de usar y que pueda crecer con el tiempo. ¡Confío en Sherpa para resolverlo!"

Tu misión es crear esta herramienta base, asegurándote de que sea funcional, escalable, y sorprenda al cliente con su potencial.

## Siguiente Paso:
Una vez superado el desafío de habilidades, se coordinará una entrevista final para conocernos en persona y discutir tu experiencia en el proceso.

¡Buena suerte y esperamos ver cómo destacas en este desafío! 🚀

Contacto CTO: agus@sherpa.wtf enviar prueba técnica
