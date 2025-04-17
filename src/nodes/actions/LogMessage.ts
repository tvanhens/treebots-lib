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

	async doTick(): Promise<BehaviorNodeStatus> {
		const message = this.props.message();

		this.statusText = message;

		return BehaviorNodeStatus.Success;
	}
}
