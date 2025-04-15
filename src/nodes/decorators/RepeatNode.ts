import type { ExecutionContext } from "../../agent";
import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export interface RepeatNodeProps {
	maxTimes?: number;
}

export class RepeatNode extends BehaviorNode {
	readonly nodeType = "repeat";

	private loopNumber: number;

	constructor(
		parent: BehaviorNode,
		id: string,
		private props?: RepeatNodeProps,
	) {
		super(parent, id);
		this.loopNumber = 0;
	}

	protected enter(executionContext: ExecutionContext): void {
		this.loopNumber = 0;
	}

	protected async doTick(executionContext: ExecutionContext): Promise<void> {
		const times = this.props?.maxTimes;

		const firstChild = this.children.at(0);

		if (!firstChild) {
			throw new Error("RepeatNode: first child is required");
		}

		if (times === undefined || this.loopNumber < times) {
			await firstChild.tick(executionContext);

			if (firstChild.getState() === BehaviorNodeStatus.Success) {
				this.loopNumber++;
				this.reset();
				this.setState(BehaviorNodeStatus.Running);
				return;
			}

			if (firstChild.getState() === BehaviorNodeStatus.Failure) {
				this.setState(BehaviorNodeStatus.Failure);
				return;
			}

			if (firstChild.getState() === BehaviorNodeStatus.Running) {
				this.setState(BehaviorNodeStatus.Running);
				return;
			}
		}

		this.setState(BehaviorNodeStatus.Success);
	}
}
