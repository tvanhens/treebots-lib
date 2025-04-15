import type { ExecutionContext } from "../..";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export interface WaitNodeProps {
	durationInMilliseconds: number;
}

/**
 * A node that waits for a specified duration before completing successfully.
 */
export class WaitNode extends BehaviorNode {
	readonly nodeType = "wait";

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: WaitNodeProps,
	) {
		super(parent, id);
	}

	protected enter(_executionContext: ExecutionContext): void {
		setTimeout(() => {
			this.setState(BehaviorNodeStatus.Success);
		}, this.props.durationInMilliseconds);
	}
}
