import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import path from "node:path";

import { Agent } from "../src";

const agent = new Agent();

agent
	.sequence((ctx) => {
		ctx.control.wait(5000);
	})
	.repeat();

agent.run();
