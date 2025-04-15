import { Agent, type ExecutionContext } from "../agent";

export enum BehaviorNodeStatus {
	Pending = "pending",
	Running = "running",
	Success = "success",
	Failure = "failure",
}

export abstract class BehaviorNode {
	readonly id: string;
	readonly parent?: BehaviorNode;
	readonly children: BehaviorNode[];

	private state: BehaviorNodeStatus;

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
			await this.doTick(executionContext);

			if (this.getState() !== BehaviorNodeStatus.Running) {
				this.exit(executionContext);
			}
		}

		return this.getState();
	}

	protected doTick(executionContext: ExecutionContext): Promise<void> | void {
		return Promise.resolve();
	}

	protected enter(_executionContext: ExecutionContext): void {}

	protected exit(_executionContext: ExecutionContext): void {}

	setState(state: BehaviorNodeStatus): void {
		if (this.state === state) {
			return;
		}

		this.getExecutionContext().eventLog.addEvent({
			type: "nodeStateChange",
			node: this.id,
			fromState: this.state,
			toState: state,
		});

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

	allChildren(): BehaviorNode[] {
		const children = this.getChildren();
		for (const child of children) {
			children.push(...child.allChildren());
		}
		return children;
	}

	getExecutionContext(): ExecutionContext {
		let parent = this.parent;
		while (parent) {
			if (parent instanceof Agent) {
				return parent.getExecutionContext();
			}
			parent = parent.parent;
		}
		throw new Error("No execution context found");
	}
}
