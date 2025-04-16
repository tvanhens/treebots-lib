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

	protected async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		this.statusText = `loop-count=${this.loopNumber}${
			this.props?.maxTimes ? `/${this.props.maxTimes}` : ""
		}`;

		const maxTimes = this.props?.maxTimes;

		const firstChild = this.children.at(0);

		if (!firstChild) {
			throw new Error("RepeatNode: first child is required");
		}

		if (maxTimes === undefined || this.loopNumber < maxTimes) {
			await firstChild.tick(executionContext);

			if (firstChild.getState() === BehaviorNodeStatus.Success) {
				this.loopNumber++;
				this.statusText = `loop-count=${this.loopNumber}${
					this.props?.maxTimes ? `/${this.props.maxTimes}` : ""
				}`;
				firstChild.reset();
				return BehaviorNodeStatus.Running;
			}

			if (firstChild.getState() === BehaviorNodeStatus.Failure) {
				return BehaviorNodeStatus.Failure;
			}

			if (firstChild.getState() === BehaviorNodeStatus.Running) {
				return BehaviorNodeStatus.Running;
			}
		}

		return BehaviorNodeStatus.Success;
	}

	reset(): void {
		this.loopNumber = 0;
		super.reset();
	}
}
