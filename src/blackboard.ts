import type { CoreMessage, experimental_createMCPClient, Tool } from "ai";

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

	getKey<K extends keyof BlackboardState>(key: K): BlackboardState[K] {
		return this.state[key];
	}

	setKey<K extends keyof BlackboardState>(
		key: K,
		value: BlackboardState[K],
	): void {
		this.state[key] = value;
	}
}
