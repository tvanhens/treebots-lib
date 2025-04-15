import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export class ClearMessagesNode extends BehaviorNode {
	readonly nodeType = "clear_messages";

	protected enter(executionContext: ExecutionContext): void {
		executionContext.blackboard.updateState({
			messages: [],
		});

		this.setState(BehaviorNodeStatus.Success);
	}
}
