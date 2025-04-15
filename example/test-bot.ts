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

agent
	.sequence("main", (ctx) => {
		ctx.tools.enable(["firecrawl::firecrawl_scrape", "fs::write_file"]);

		// Scrape the page

		ctx.messages.user`Use firecrawl to scrape ${pageUrl}`;
		ctx.infer.text("scrapeResult", openrouter("anthropic/claude-3.5-haiku"));

		// Translate the result into Spanish

		ctx.messages.user`Translate the result into Spanish.`;
		ctx.infer.text(
			"translateResult",
			openrouter("google/gemini-2.5-pro-preview-03-25"),
		);

		// Write the result into a text file

		ctx.messages
			.user`Write the result into a text file in ${resultsDirectory}/TRANSLATED.md.`;
		ctx.infer.text("writeFileResult", openrouter("anthropic/claude-3.5-haiku"));
	})
	.repeat(2);

agent.run();
