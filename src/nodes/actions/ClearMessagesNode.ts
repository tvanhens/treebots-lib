import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export class ClearMessagesNode extends BehaviorNode {
	readonly nodeType = "clear_messages";

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		executionContext.messageStore.clearMessages();
		return BehaviorNodeStatus.Success;
	}
}
