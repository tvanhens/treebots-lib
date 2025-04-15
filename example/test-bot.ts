import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Agent, SequenceNode, AddMessageNode, InferTextNode } from "../src";
import { WaitNode } from "../src/nodes/actions/WaitNode";

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

new WaitNode(rootSequence, "wait", {
	durationInMilliseconds: 10000,
});

agent.run();
