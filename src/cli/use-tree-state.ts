import { useEffect, useState } from "react";
import { BehaviorNodeStatus, type BehaviorNode } from "../nodes";
import type { Agent } from "../agent";

function getNestingLevel(node: BehaviorNode): number {
	const parent = node.parent;
	if (!parent) {
		return 0;
	}
	return 1 + getNestingLevel(parent);
}

export function useTreeState(agent: Agent) {
	const [state, setState] = useState<
		Record<
			string,
			{
				status: BehaviorNodeStatus;
				nestingLevel: number;
				nodeType: string;
				shouldDisplay: boolean;
				childrenCount: number;
			}
		>
	>({});

	useEffect(() => {
		const nodes = agent.allChildren();
		const interval = setInterval(() => {
			const newStatus: Record<
				string,
				{
					status: BehaviorNodeStatus;
					nestingLevel: number;
					nodeType: string;
					shouldDisplay: boolean;
					childrenCount: number;
				}
			> = {};
			for (const node of nodes) {
				newStatus[node.id] = {
					status: node.getState(),
					nestingLevel: getNestingLevel(node),
					nodeType: node.nodeType,
					shouldDisplay: node.parent?.getState() === BehaviorNodeStatus.Running,
					childrenCount: node.allChildren().length,
				};
			}
			setState(newStatus);
		}, 50);
		return () => clearInterval(interval);
	}, [agent]);

	return state;
}
