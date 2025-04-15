import { useEffect, useState } from "react";
import type { BehaviorNode, BehaviorNodeStatus } from "../nodes";
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
				}
			> = {};
			for (const node of nodes) {
				newStatus[node.id] = {
					status: node.getState(),
					nestingLevel: getNestingLevel(node),
					nodeType: node.nodeType,
				};
			}
			setState(newStatus);
		}, 50);
		return () => clearInterval(interval);
	}, [agent]);

	return state;
}
