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

	timeRemaining: number;
	lastTick: number;

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: WaitNodeProps,
	) {
		super(parent, id);
		this.timeRemaining = props.durationInMilliseconds;
		this.lastTick = Date.now();
	}

	protected async doTick(): Promise<BehaviorNodeStatus> {
		const now = Date.now();
		if (this.getState() === BehaviorNodeStatus.Pending) {
			this.lastTick = now;
		}
		this.timeRemaining -= now - this.lastTick;
		this.lastTick = now;

		if (this.timeRemaining <= 0) {
			this.timeRemaining = 0;
			return BehaviorNodeStatus.Success;
		}

		return BehaviorNodeStatus.Running;
	}

	reset(): void {
		this.timeRemaining = this.props.durationInMilliseconds;
		this.lastTick = Date.now();
		super.reset();
	}
}
