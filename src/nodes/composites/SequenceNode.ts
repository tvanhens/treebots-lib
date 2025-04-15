import type { ExecutionContext } from "../../agent";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

/**
 * A composite node that executes its children in order.
 * If a child returns Failure, the sequence is stopped and the node returns Failure.
 * If a child returns Running, the node returns Running.
 * If all children return Success, the node returns Success.
 */
export class SequenceNode extends BehaviorNode {
	async enter(_executionContext: ExecutionContext): Promise<void> {
		for (const child of this.children) {
			child.setState(BehaviorNodeStatus.Pending);
		}
	}

	async doTick(executionContext: ExecutionContext): Promise<void> {
		for (const child of this.children) {
			const status = await child.tick(executionContext);

			if (status === BehaviorNodeStatus.Failure) {
				this.setState(BehaviorNodeStatus.Failure);
				return;
			}

			if (status === BehaviorNodeStatus.Running) {
				this.setState(BehaviorNodeStatus.Running);
				return;
			}
		}

		this.setState(BehaviorNodeStatus.Success);
	}

	async exit(_executionContext: ExecutionContext): Promise<void> {
		for (const child of this.children) {
			child.setState(BehaviorNodeStatus.Pending);
		}
		this.setState(BehaviorNodeStatus.Pending);
	}
}
