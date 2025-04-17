import type { CoreMessage, experimental_createMCPClient, Tool } from "ai";
import type { BehaviorNode } from "./nodes/BehaviorNode";

type MCPClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;

interface BlackboardState {
	__messages: CoreMessage[];
	__tools: Record<string, Tool>;
	__mcpClients: Record<string, MCPClient>;
	[key: string]: unknown;
}

export class Blackboard {
	private state: BlackboardState;

	constructor(state?: BlackboardState) {
		this.state = state ?? {
			__messages: [],
			__tools: {},
			__mcpClients: {},
		};
	}

	getKey(key: string): unknown {
		return this.state[key];
	}

	getPath(...path: string[]): unknown {
		return path.reduce((acc, key) => {
			if (typeof acc !== "object" || acc === null) {
				return undefined;
			}
			return (acc as Record<string, unknown>)[key];
		}, this.state as unknown);
	}

	setKey(key: string, value: unknown): void {
		this.state[key] = value;
	}

	saveResult(node: BehaviorNode, result: unknown): void {
		this.state[`__node_result.${node.id}`] = result;
	}

	addMessage(message: CoreMessage): void {
		this.state.__messages = [...((this.state.__messages as []) ?? []), message];
	}

	getMessages(): CoreMessage[] {
		return this.state.__messages as CoreMessage[];
	}

	clearMessages(): void {
		this.state.__messages = [];
	}

	getTools(): Record<string, Tool> {
		return this.state.__tools as Record<string, Tool>;
	}

	mergeTools(tools: Record<string, Tool>): void {
		this.state.__tools = {
			...(this.state.__tools as Record<string, Tool>),
			...tools,
		};
	}

	getMCPClient(id: string): MCPClient | undefined {
		return this.state.__mcpClients[id];
	}

	getMCPClients(): Record<string, MCPClient> {
		return this.state.__mcpClients as Record<string, MCPClient>;
	}

	mergeMCPClient(id: string, mcpClient: MCPClient): void {
		this.state.__mcpClients[id] = mcpClient;
	}
}
