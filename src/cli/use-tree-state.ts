import { useEffect, useState } from "react";
import type { BehaviorNodeStatus } from "../nodes";
import type { Agent } from "../agent";

export function useTreeState(agent: Agent) {
	const [state, setState] = useState<Record<string, BehaviorNodeStatus>>({});

	useEffect(() => {
		const nodes = agent.allChildren();
		const interval = setInterval(() => {
			const newStatus: Record<string, BehaviorNodeStatus> = {};
			for (const node of nodes) {
				newStatus[node.id] = node.getState();
			}
			setState(newStatus);
		}, 50);
		return () => clearInterval(interval);
	}, [agent]);

	return state;
}
