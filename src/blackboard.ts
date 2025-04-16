import type { BehaviorNode } from "./nodes/BehaviorNode";

export class Blackboard {
	private state: Record<string, unknown>;

	constructor() {
		this.state = {};
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
}
