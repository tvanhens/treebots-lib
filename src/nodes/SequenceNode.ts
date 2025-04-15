import type { ExecutionContext } from "../agent";

import { BehaviorNode, BehaviorNodeStatus } from "./BehaviorNode";

export class SequenceNode extends BehaviorNode {
	async enter(_executionContext: ExecutionContext): Promise<void> {
		for (const child of this.children) {
			child.setState(BehaviorNodeStatus.Pending);
		}
	}

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		for (const child of this.children) {
			const status = await child.tick(executionContext);

			if (status === BehaviorNodeStatus.Failure) {
				return BehaviorNodeStatus.Failure;
			}

			if (status === BehaviorNodeStatus.Running) {
				return BehaviorNodeStatus.Running;
			}
		}

		return BehaviorNodeStatus.Success;
	}
}
