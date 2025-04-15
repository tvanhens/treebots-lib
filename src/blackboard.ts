import type { CoreMessage } from "ai";

export class Blackboard<T extends Record<string, unknown>> {
	private state: T & { messages: CoreMessage[] };

	constructor(initState: Omit<T, "messages">) {
		this.state = {
			...initState,
			messages: [] as CoreMessage[],
		} as T & { messages: CoreMessage[] };
	}

	getKey<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] {
		return this.state[key] as T[K];
	}

	updateState(update: Partial<T>): void {
		this.state = {
			...this.state,
			...update,
		} as T & { messages: CoreMessage[] };
	}
}
