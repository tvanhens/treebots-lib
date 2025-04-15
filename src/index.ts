import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SequenceNode, AddMessageNode, InferTextNode } from "./nodes";
import { Agent } from "./agent";

const openrouter = createOpenRouter();

const agent = new Agent();

const rootSequence = new SequenceNode(agent, "root");

new AddMessageNode(rootSequence, "userQuestion", {
	role: "user",
	message: "Hello, how are you?",
});

new InferTextNode(rootSequence, "assistantResponse", {
	model: openrouter("openai/gpt-4o"),
});

agent.run();
