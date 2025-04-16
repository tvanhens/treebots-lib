import { Agent, type ExecutionContext } from "../agent";

export enum BehaviorNodeStatus {
	Pending = "pending",
	Running = "running",
	Success = "success",
	Failure = "failure",
}

export abstract class BehaviorNode {
	readonly id: string;
	parent?: BehaviorNode;
	children: BehaviorNode[];
	abstract readonly nodeType: string;
	statusText = "";

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
		if (this.isFinished()) {
			return this.state;
		}

		const state = await this.doTick(executionContext);
		if (state !== this.state) {
			this.state = state;
			executionContext.eventLog.addEvent({
				type: "nodeStateChange",
				node: this.id,
				fromState: this.state,
				toState: state,
			});
		}
		return state;
	}

	protected abstract doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> | BehaviorNodeStatus;

	getState(): BehaviorNodeStatus {
		return this.state;
	}

	addChild(child: BehaviorNode): void {
		this.children.push(child);
		child.parent = this;
	}

	getChildren(): BehaviorNode[] {
		return this.children;
	}

	allChildren(): BehaviorNode[] {
		const children: BehaviorNode[] = [];
		for (const child of this.getChildren()) {
			children.push(child);
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

	reset(): void {
		this.state = BehaviorNodeStatus.Pending;
		this.statusText = "";
		for (const child of this.children) {
			child.reset();
		}
	}

	removeChild(child: BehaviorNode): void {
		this.children = this.children.filter((c) => c !== child);
		child.parent = undefined;
	}

	isFinished(): boolean {
		return (
			this.state === BehaviorNodeStatus.Success ||
			this.state === BehaviorNodeStatus.Failure
		);
	}
}
