import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import path from "node:path";

import { Agent } from "../src";

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

const pageUrl =
	"https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/src/filesystem/README.md";

agent.sequence("main", (ctx) => {
	ctx.enableTools("enableTools", {
		tools: ["firecrawl::firecrawl_scrape", "fs::write_file"],
	});

	// Scrape the page

	ctx.addMessage("requestScrape", {
		role: "user",
		message: `Use firecrawl to scrape ${pageUrl}`,
	});
	ctx.inferText("scrapeResult", {
		model: openrouter("anthropic/claude-3.5-haiku"),
	});

	// Translate the result into Spanish

	ctx.addMessage("requestTranslate", {
		role: "user",
		message: "Translate the result into Spanish.",
	});
	ctx.inferText("translateResult", {
		model: openrouter("google/gemini-2.5-pro-preview-03-25"),
	});

	// Write the result into a text file

	ctx.addMessage("writeFile", {
		role: "user",
		message: `Write the result into a text file in ${resultsDirectory}/TRANSLATED.md.`,
	});
	ctx.inferText("writeFileResult", {
		model: openrouter("anthropic/claude-3.5-haiku"),
	});
});

agent.run();
