import type { CoreMessage, experimental_createMCPClient, Tool } from "ai";

interface BlackboardState {
	__messages: CoreMessage[];
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
		const value = this.state[key];
		if (typeof value === "object" && value !== null) {
			return Object.freeze(value);
		}
		return value;
	}

	setKey<K extends keyof BlackboardState>(
		key: K,
		value: BlackboardState[K],
	): void {
		this.state[key] = value;
	}
}
