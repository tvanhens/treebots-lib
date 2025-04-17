import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export class ClearMessagesNode extends BehaviorNode {
	readonly nodeType = "clear_messages";

	async doTick(): Promise<BehaviorNodeStatus> {
		const messageCount = this.getBlackboard().getKey("__messages").length;
		this.getBlackboard().setKey("__messages", []);
		this.statusText = `messages-removed=${messageCount}`;
		return BehaviorNodeStatus.Success;
	}
}
