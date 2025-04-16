import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export class ClearMessagesNode extends BehaviorNode {
	readonly nodeType = "clear_messages";

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		const messageCount = executionContext.messageStore.getMessages().length;
		executionContext.messageStore.clearMessages();
		this.statusText = `messages-removed=${messageCount}`;
		return BehaviorNodeStatus.Success;
	}
}
