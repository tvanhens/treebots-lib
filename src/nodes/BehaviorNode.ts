import type { Blackboard } from "../blackboard";

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

	protected blackboard: Blackboard | undefined;
	private state: BehaviorNodeStatus;

	constructor(parent: BehaviorNode | undefined, id: string) {
		this.id = id;
		this.state = BehaviorNodeStatus.Pending;
		this.parent = parent;
		this.children = [];
		this.blackboard = parent?.blackboard;
		if (parent) {
			parent.addChild(this);
		}
	}

	async tick(): Promise<BehaviorNodeStatus> {
		if (this.isFinished()) {
			return this.state;
		}

		const state = await this.doTick();
		if (state !== this.state) {
			this.state = state;
		}
		return state;
	}

	protected abstract doTick(): Promise<BehaviorNodeStatus> | BehaviorNodeStatus;

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

	getBlackboard(): Blackboard {
		if (!this.blackboard) {
			throw new Error("Blackboard not found");
		}
		return this.blackboard;
	}
}
