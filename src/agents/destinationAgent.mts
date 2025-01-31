import dotenv from "dotenv";
dotenv.config();
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", "Sugiere un destino para viajar, indicando lugares de interés y sugerencias de actividades, en base a una descripción"],
    ["user", "Quiero viajar hacia {description}"],
]);

// Initialize memory to persist state between graph runs
const agentTools = [new TavilySearchResults({ maxResults: 3 })];
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
    llm: llm,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
});

// Now it's time to use!
const promptValue = await promptTemplate.invoke({ description: "Santa Catarina, Brasil, algun lugar tranquilo con playas familieras" }, llm);
promptValue.toChatMessages();

const response = await agent.invoke(promptValue, { configurable: { thread_id: "42" }});
console.log(`${response.messages[response.messages.length - 1].content}`);