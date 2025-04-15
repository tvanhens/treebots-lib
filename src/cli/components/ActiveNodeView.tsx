import { useState } from "react";
import { useEffect } from "react";
import type { Agent } from "../../agent";
import {
	type BehaviorNode,
	BehaviorNodeStatus,
} from "../../nodes/BehaviorNode";
import { NodeState } from "./NodeState";
import { Box } from "ink";

interface ActiveNodeViewProps {
	agent: Agent;
}

function useRunningNodes(agent: Agent) {
	const [runningNodes, setRunningNodes] = useState<BehaviorNode[]>([]);

	useEffect(() => {
		setInterval(() => {
			setRunningNodes(
				agent
					.allChildren()
					.filter((node) => node.getState() === BehaviorNodeStatus.Running),
			);
		}, 100);
	}, [agent]);

	return runningNodes;
}

export function ActiveNodeView({ agent }: ActiveNodeViewProps) {
	const runningNodes = useRunningNodes(agent);

	return (
		<Box>
			{runningNodes.map((node) => (
				<NodeState key={node.id} node={node} />
			))}
		</Box>
	);
}
