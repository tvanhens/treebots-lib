import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Agent, SequenceNode, AddMessageNode, InferTextNode } from "../src";
import { WaitNode } from "../src/nodes/actions/WaitNode";
import { EnableTools } from "../src/nodes/actions/EnableTool";

const openrouter = createOpenRouter();

const agent = new Agent();

await agent.addStdioMCP("firecrawl", {
	command: "firecrawl-mcp",
});

const main = new SequenceNode(agent, "main");

const pageUrl =
	"https://auctions.yahoo.co.jp/search/search?p=fender+japan&auccat=22436&va=fender+japan&istatus=2&new=1&is_postage_mode=1&dest_pref_code=13&b=1&n=50&s1=new&o1=d&mode=1";

new EnableTools(main, "enableTools", {
	tools: ["firecrawl::firecrawl_scrape"],
});

new AddMessageNode(main, "requestScrape", {
	role: "user",
	message: `Use firecrawl to scrape ${pageUrl}`,
});

new InferTextNode(main, "scrapeResult", {
	model: openrouter("openai/gpt-4o"),
});

new WaitNode(main, "wait", {
	durationInMilliseconds: 10000,
});

agent.run();
