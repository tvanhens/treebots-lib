import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

/**
 * A composite node that executes its children in order.
 * If a child returns Failure, the sequence continues to the next child.
 * If a child returns Running, the node returns Running.
 * If all children return Success, the node returns Success.
 */
export class FallbackNode extends BehaviorNode {
	readonly nodeType = "fallback";
	pendingChildren: BehaviorNode[] | undefined;

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		if (this.pendingChildren === undefined) {
			this.pendingChildren = [...this.children];
		}

		this.statusText = `num-pending=${this.pendingChildren.length}`;

		const nextChild = this.pendingChildren.shift();

		if (nextChild === undefined) {
			// If we reach the end without getting a success we return failure
			return BehaviorNodeStatus.Failure;
		}

		const state = await nextChild.tick(executionContext);

		if (state === BehaviorNodeStatus.Failure) {
			// On failure we continue running to "fallback" to the next node
			return BehaviorNodeStatus.Running;
		}

		if (state === BehaviorNodeStatus.Success) {
			// On success we return success and stop running
			return BehaviorNodeStatus.Success;
		}

		this.pendingChildren.unshift(nextChild);
		return BehaviorNodeStatus.Running;
	}

	reset(): void {
		this.pendingChildren = undefined;
		super.reset();
	}
}
