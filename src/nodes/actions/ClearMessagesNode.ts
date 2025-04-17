import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export class ClearMessagesNode extends BehaviorNode {
	readonly nodeType = "clear_messages";

	async doTick(): Promise<BehaviorNodeStatus> {
		const messageCount = this.getBlackboard().getMessages().length;
		this.getBlackboard().clearMessages();
		this.statusText = `messages-removed=${messageCount}`;
		return BehaviorNodeStatus.Success;
	}
}
