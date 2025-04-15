import { Blackboard } from "./blackboard";
import { monitorAgent } from "./cli";
import { EventLog } from "./event-log";

import { BehaviorNode } from "./nodes";

export interface ExecutionContext<
	T extends Record<string, unknown> = Record<string, unknown>,
> {
	blackboard: Blackboard<T>;
	eventLog: EventLog;
}

export class Agent extends BehaviorNode {
	readonly id = "agent";
	readonly children: BehaviorNode[] = [];

	private context: ExecutionContext;

	constructor() {
		super(undefined, "agent");
		this.context = {
			blackboard: new Blackboard({}),
			eventLog: new EventLog(),
		};
	}

	async run(): Promise<void> {
		const root = this.getRoot();
		monitorAgent(this);
		(async () => {
			while (true) {
				if (root instanceof BehaviorNode) {
					await root.tick(this.context);
				}
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
}
