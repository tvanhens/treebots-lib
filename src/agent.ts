import { Experimental_StdioMCPTransport, type StdioConfig } from "ai/mcp-stdio";
import { experimental_createMCPClient as createMCPClient, type Tool } from "ai";

import type { BodyScope, NodeHandle } from "./dsl";
import { buildScope, makeNodeHandle } from "./dsl";
import { Blackboard } from "./blackboard";
import { monitorAgent } from "./cli";
import { BehaviorNode, type BehaviorNodeStatus, SequenceNode } from "./nodes";
import { MessageStore } from "./messages";

export interface ExecutionContext {
	blackboard: Blackboard;
	enabledTools: Record<string, Tool>;
	mcpClients: Record<string, Awaited<ReturnType<typeof createMCPClient>>>;
	messageStore: MessageStore;
	fork(): ExecutionContext;
}

export class Agent extends BehaviorNode {
	readonly id = "agent";
	readonly nodeType = "agent";
	readonly children: BehaviorNode[] = [];

	private context: ExecutionContext;

	constructor() {
		super(undefined, "agent");
		this.context = {
			blackboard: new Blackboard(),
			enabledTools: {},
			mcpClients: {},
			messageStore: new MessageStore(),
			fork: () => ({
				...this.context,
				// TODO: maybe we want to clone other things here?
				messageStore: this.context.messageStore.fork(),
			}),
		};

		process.on("SIGINT", async () => {
			for (const client of Object.values(this.context.mcpClients)) {
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
					await this.tick(this.context);
				}
				// TODO: this is gross, we should try to make it event based.
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		})();
	}

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		const root = this.getRoot();
		return root.tick(executionContext);
	}

	getRoot(): BehaviorNode {
		const root = this.children[0];
		if (!root) {
			throw new Error("Root node not found");
		}
		return root;
	}

	getExecutionContext(): ExecutionContext {
		return this.context;
	}

	async addStdioMCP(id: string, transport: StdioConfig) {
		const client = createMCPClient({
			transport: new Experimental_StdioMCPTransport(transport),
		});
		this.context.mcpClients[id] = await client;
	}

	sequence(body: (ctx: BodyScope) => void): NodeHandle {
		const root = new SequenceNode(this, "main");
		body(buildScope(root));
		return makeNodeHandle(root);
	}
}
