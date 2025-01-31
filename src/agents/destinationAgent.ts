import dotenv from "dotenv";
dotenv.config();
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", "Sugiere un destino para viajar, indicando lugares de interés y sugerencias de actividades, en base a una descripción"],
    new HumanMessage("Quiero viajar hacia {description}"),
]);

const response = await promptTemplate.invoke({ description: "Santa Catarina, Brasil, algun lugar tranquilo con playas familieras" }, llm);
console.log(response);