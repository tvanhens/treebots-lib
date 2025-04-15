import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import path from "node:path";

import { Agent, SequenceNode, AddMessageNode, InferTextNode } from "../src";
import { EnableTools } from "../src/nodes/actions/EnableTool";

const openrouter = createOpenRouter();

const agent = new Agent();

const resultsDirectory = path.join(process.cwd(), "tmp");

await agent.addStdioMCP("firecrawl", {
	command: "bunx",
	args: ["firecrawl-mcp"],
});

await agent.addStdioMCP("fs", {
	command: "bunx",
	args: ["@modelcontextprotocol/server-filesystem", resultsDirectory],
});

const main = new SequenceNode(agent, "main");

const pageUrl =
	"https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/src/filesystem/README.md";

new EnableTools(main, "enableTools", {
	tools: ["firecrawl::firecrawl_scrape", "fs::write_file"],
});

new AddMessageNode(main, "requestScrape", {
	role: "user",
	message: `Use firecrawl to scrape ${pageUrl}`,
});

new InferTextNode(main, "scrapeResult", {
	// Simple task so lets use a small model
	model: openrouter("anthropic/claude-3.5-haiku"),
});

new AddMessageNode(main, "translateResult", {
	role: "user",
	message: "Translate the result into Spanish.",
});

new InferTextNode(main, "translateResult", {
	// Let's use a larger model optimized for translation
	model: openrouter("google/gemini-2.5-pro-preview-03-25"),
});

new AddMessageNode(main, "writeFile", {
	role: "user",
	message: `Write the result into a text file in ${resultsDirectory}/TRANSLATED.md.`,
});

new InferTextNode(main, "writeFileResult", {
	// Simple task so lets use a small model
	model: openrouter("anthropic/claude-3.5-haiku"),
});

agent.run();
