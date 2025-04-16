import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

/**
 * A composite node that executes its children in order.
 * If a child returns Failure, the sequence is stopped and the node returns Failure.
 * If a child returns Running, the node returns Running.
 * If all children return Success, the node returns Success.
 */
export class SequenceNode extends BehaviorNode {
	readonly nodeType = "sequence";
	pendingChildren: BehaviorNode[] | undefined;

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		if (this.pendingChildren === undefined) {
			this.pendingChildren = [...this.children];
		}

		const nextChild = this.pendingChildren.shift();

		if (nextChild === undefined) {
			return BehaviorNodeStatus.Success;
		}

		const state = await nextChild.tick(executionContext);

		if (state === BehaviorNodeStatus.Failure) {
			return BehaviorNodeStatus.Failure;
		}

		if (state === BehaviorNodeStatus.Success) {
			return BehaviorNodeStatus.Running;
		}

		this.pendingChildren.unshift(nextChild);
		return BehaviorNodeStatus.Running;
	}

	reset(): void {
		this.pendingChildren = undefined;
		super.reset();
	}
}
