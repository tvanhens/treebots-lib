import type { ExecutionContext } from "../..";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

interface WaitNodeOptions {
	durationInMilliseconds: number;
}

/**
 * A node that waits for a specified duration before completing successfully.
 */
export class WaitNode extends BehaviorNode {
	constructor(
		parent: BehaviorNode,
		id: string,
		private options: WaitNodeOptions,
	) {
		super(parent, id);
	}

	protected enter(_executionContext: ExecutionContext): void {
		setTimeout(() => {
			this.setState(BehaviorNodeStatus.Success);
		}, this.options.durationInMilliseconds);
	}
}
