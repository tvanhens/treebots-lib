import type { ExecutionContext } from "../..";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export interface LogMessageProps {
	message: () => string;
}

export class LogMessage extends BehaviorNode {
	readonly nodeType = "log-message";

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: LogMessageProps,
	) {
		super(parent, id);
	}

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		executionContext.eventLog.addEvent({
			type: "logMessage",
			message: this.props.message(),
		});

		return BehaviorNodeStatus.Success;
	}
}
