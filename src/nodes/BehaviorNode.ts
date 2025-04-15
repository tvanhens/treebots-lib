import type { ExecutionContext } from "../agent";

export enum BehaviorNodeStatus {
	Pending = 0,
	Running = 1,
	Success = 2,
	Failure = 3,
}

export abstract class BehaviorNode {
	readonly id: string;
	readonly parent?: BehaviorNode;

	private state: BehaviorNodeStatus;
	protected children: BehaviorNode[];

	constructor(parent: BehaviorNode | undefined, id: string) {
		this.id = id;
		this.state = BehaviorNodeStatus.Pending;
		this.parent = parent;
		this.children = [];
		if (parent) {
			parent.addChild(this);
		}
	}

	async tick(executionContext: ExecutionContext): Promise<BehaviorNodeStatus> {
		if (this.getState() === BehaviorNodeStatus.Pending) {
			this.setState(BehaviorNodeStatus.Running);
			this.enter(executionContext);
		}

		if (this.getState() === BehaviorNodeStatus.Running) {
			const status = await this.doTick(executionContext);

			if (status !== BehaviorNodeStatus.Running) {
				this.setState(status);
				this.exit(executionContext);
			}
		}

		return this.getState();
	}

	protected doTick(
		executionContext: ExecutionContext,
	): BehaviorNodeStatus | Promise<BehaviorNodeStatus> {
		return BehaviorNodeStatus.Success;
	}

	protected enter(_executionContext: ExecutionContext): void {}

	protected exit(_executionContext: ExecutionContext): void {}

	setState(state: BehaviorNodeStatus): void {
		if (this.state === state) {
			return;
		}

		this.state = state;
	}

	getState(): BehaviorNodeStatus {
		return this.state;
	}

	addChild(child: BehaviorNode): void {
		this.children.push(child);
	}

	getChildren(): BehaviorNode[] {
		return this.children;
	}
}
