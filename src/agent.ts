import { Experimental_StdioMCPTransport, type StdioConfig } from "ai/mcp-stdio";
import { experimental_createMCPClient as createMCPClient, type Tool } from "ai";

import type { BodyScope, NodeHandle } from "./dsl";
import { buildScope, makeNodeHandle } from "./dsl";
import { Blackboard } from "./blackboard";
import { monitorAgent } from "./cli";
import { BehaviorNode, type BehaviorNodeStatus, SequenceNode } from "./nodes";

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>;

export class Agent extends BehaviorNode {
	readonly id = "agent";
	readonly nodeType = "agent";
	readonly children: BehaviorNode[] = [];
	readonly mcpClients: Record<string, MCPClient> = {};

	constructor() {
		super(undefined, "agent");

		const blackboard = new Blackboard();

		this.blackboard = blackboard;

		process.on("SIGINT", async () => {
			for (const client of Object.values(this.mcpClients)) {
				await client.close();
			}

			process.exit(0);
		});
	}

	async run(): Promise<void> {
		const root = this.getRoot();
		monitorAgent(this);
		(async () => {
			while (true) {
				if (root instanceof BehaviorNode) {
					await this.tick();
				}
				// TODO: this is gross, we should try to make it event based.
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		})();
	}

	async doTick(): Promise<BehaviorNodeStatus> {
		const root = this.getRoot();
		return root.tick();
	}

	getRoot(): BehaviorNode {
		const root = this.children[0];
		if (!root) {
			throw new Error("Root node not found");
		}
		return root;
	}

	async addStdioMCP(id: string, transport: StdioConfig) {
		const client = createMCPClient({
			transport: new Experimental_StdioMCPTransport(transport),
		});
		this.mcpClients[id] = await client;
	}

	sequence(body: (ctx: BodyScope) => void): NodeHandle {
		const root = new SequenceNode(this, "main");
		body(buildScope(root));
		return makeNodeHandle(root);
	}

	static getAgent(node: BehaviorNode): Agent {
		if (node instanceof Agent) {
			return node;
		}

		if (!node.parent) {
			throw new Error("Agent not found");
		}

		return Agent.getAgent(node.parent);
	}

	async getTool(name: string): Promise<Tool> {
		const [mcpId, toolName] = name.split("::");
		if (!mcpId || !toolName) {
			throw new Error(`Invalid tool: ${name}`);
		}

		const mcpClient = this.mcpClients[mcpId];
		if (!mcpClient) {
			throw new Error(`MCP client not found: ${mcpId}`);
		}

		const tools = await mcpClient.tools();
		const tool = tools[toolName];
		if (!tool) {
			throw new Error(
				`Tool not found: ${toolName}, available tools: ${Object.keys(
					tools,
				).join(", ")}`,
			);
		}

		return tool;
	}
}
