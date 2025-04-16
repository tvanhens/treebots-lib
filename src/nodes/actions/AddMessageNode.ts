import type { ExecutionContext } from "../../agent";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export interface AddMessageNodeProps {
	role: "user" | "assistant" | "system";
	message: () => string;
}

/**
 * A node that adds a message to the execution context.
 */
export class AddMessageNode extends BehaviorNode {
	readonly nodeType = "add-message";

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: AddMessageNodeProps,
	) {
		super(parent, id);
	}

	async doTick(ctx: ExecutionContext): Promise<BehaviorNodeStatus> {
		const message = this.props.message();

		ctx.messageStore.addMessage({
			role: this.props.role,
			content: message,
		});

		this.statusText = `${this.props.role}: ${message}`;

		return BehaviorNodeStatus.Success;
	}
}
