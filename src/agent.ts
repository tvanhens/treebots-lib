import { BehaviorNode } from "./nodes";
import { Blackboard } from "./blackboard";
import { monitorAgent } from "./cli";

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
		const root = this.getRoot();
		monitorAgent(this);
		(async () => {
			while (true) {
				await root.tick(this.context);
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
}
