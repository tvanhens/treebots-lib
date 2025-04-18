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

agent
	.sequence((ctx) => {
		ctx.messages.clear();

		ctx.messages.user`Read the file ${resultsDirectory}/TODO.md`;
		ctx.infer.text(openrouter("anthropic/claude-3.5-haiku"), {
			tools: ["fs::read_file"],
		});

		ctx.control.fallback((ctx) => {
			ctx.control.sequence((ctx) => {
				ctx.messages.user`Are there urls in the file?`;
				ctx.infer.yesNo(openrouter("anthropic/claude-3.7-sonnet"));

				ctx.util.log`Urls found in ${resultsDirectory}/TODO.md, processing...`;

				ctx.messages.system`
            <instructions>
            Using the file that was read, format a response to the user's request.
            </instructions>

            <response_format>
            <name>{the name of the file to scrape}</name>
            <url>{the url to scrape}</url>
            </response_format>
        `;
				ctx.messages.user`Choose a url from the file.`;
				const chosenUrl = ctx.infer.text(
					openrouter("anthropic/claude-3.7-sonnet"),
				);
				ctx.util.log`Chosen url: ${chosenUrl.$("text")}`;

				// Scrape the page

				ctx.messages.user`Use firecrawl to scrape the next chosen url.`;
				ctx.infer.text(openrouter("anthropic/claude-3.5-haiku"), {
					tools: ["firecrawl::firecrawl_scrape"],
				});

				// Translate the result into Spanish

				ctx.messages.user`Translate the result into Spanish.`;
				ctx.infer.text(openrouter("google/gemini-2.5-pro-preview-03-25"));

				// Write the result into a text file

				ctx.messages.user`
          Write the translated result into a text file in ${resultsDirectory}/out_{name}.md
        `;
				ctx.infer.text(openrouter("anthropic/claude-3.5-haiku"), {
					tools: ["fs::write_file"],
				});

				ctx.messages.user`
          Write a ${resultsDirectory}/TODO.md using write_file, do not read before writing.
          Remove the list entry for the url and name you have just scraped and write an updated version of the file without it.
          Leave the other entries in the file in the same format.
          It is OK to remove the entire list if you have scraped all the items.
        `;
				ctx.infer.text(openrouter("anthropic/claude-3.5-haiku"), {
					tools: ["fs::write_file"],
				});
			});

			ctx.control.sequence((ctx) => {
				ctx.util.log`
          No urls found. Waiting for ${resultsDirectory}/TODO.md to be updated.
        `;
				// Wait for file to be updated.
				ctx.control.wait(30000);
			});
		});
	})
	.repeat();

agent.run();
