import type { CoreMessage } from "ai";
import type { ExecutionContext } from "../agent";

import { BehaviorNode, BehaviorNodeStatus } from "./BehaviorNode";

interface AddMessageNodeProps {
	role: "user" | "assistant" | "system";
	message: string;
}

export class AddMessageNode extends BehaviorNode {
	constructor(
		parent: BehaviorNode,
		id: string,
		private props: AddMessageNodeProps,
	) {
		super(parent, id);
	}

	async enter(executionContext: ExecutionContext): Promise<void> {
		executionContext.blackboard.updateState({
			messages: [
				...(executionContext.blackboard.getKey("messages") as CoreMessage[]),
				{
					role: this.props.role,
					content: this.props.message,
				},
			],
		});
		this.setState(BehaviorNodeStatus.Success);
	}
}
