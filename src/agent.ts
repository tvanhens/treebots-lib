import { Blackboard } from "./blackboard";
import { monitorAgent } from "./cli";
import { EventLog } from "./event-log";

import { BehaviorNode, SequenceNode } from "./nodes";

import { Experimental_StdioMCPTransport, type StdioConfig } from "ai/mcp-stdio";
import { experimental_createMCPClient as createMCPClient, type Tool } from "ai";
import type { BodyScope, NodeHandle } from "./dsl";
import { buildScope, makeNodeHandle } from "./dsl";

export interface ExecutionContext<
	T extends Record<string, unknown> = Record<string, unknown>,
> {
	blackboard: Blackboard<T>;
	eventLog: EventLog;
	enabledTools: Record<string, Tool>;
	mcpClients: Record<string, Awaited<ReturnType<typeof createMCPClient>>>;
}

export class Agent extends BehaviorNode {
	readonly id = "agent";
	readonly nodeType = "agent";
	readonly children: BehaviorNode[] = [];

	private context: ExecutionContext;

	constructor() {
		super(undefined, "agent");
		this.context = {
			blackboard: new Blackboard({}),
			eventLog: new EventLog(),
			enabledTools: {},
			mcpClients: {},
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
					await root.tick(this.context);
				}
				// TODO: this is gross, we should try to make it event based.
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		})();
	}

	getRoot(): BehaviorNode {
		const root = this.children[0];
		if (!root) {
			throw new Error("Root node not found");
		}
		return root;
	}

	getEventLog(): EventLog {
		return this.context.eventLog;
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

	sequence(id: string, body: (ctx: BodyScope) => void): NodeHandle {
		const root = new SequenceNode(this, id);
		body(buildScope(root));
		return makeNodeHandle(root);
	}
}
