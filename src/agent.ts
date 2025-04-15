import { BehaviorNode } from "./nodes";
import { Blackboard } from "./blackboard";

export interface ExecutionContext<
	T extends Record<string, unknown> = Record<string, unknown>,
> {
	blackboard: Blackboard<T>;
}

export class Agent extends BehaviorNode {
	private context: ExecutionContext;

	constructor() {
		super(undefined, "agent");
		this.context = {
			blackboard: new Blackboard({}),
		};
	}

	async run(): Promise<void> {
		const root = this.children[0];
		if (!root) {
			throw new Error("Root node not found");
		}
		await root.tick(this.context);
	}
}
