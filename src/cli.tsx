import React, { useState, useEffect } from "react";
import { Box, render, Text } from "ink";
import type { Agent } from "./agent";
import type { BehaviorNodeStatus } from "./nodes";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	const [status, setStatus] = useState<Record<string, BehaviorNodeStatus>>({});

	useEffect(() => {
		const nodes = agent.allChildren();
		const interval = setInterval(() => {
			const newStatus: Record<string, BehaviorNodeStatus> = {};
			for (const node of nodes) {
				newStatus[node.id] = node.getState();
			}
			setStatus(newStatus);
		}, 50);
		return () => clearInterval(interval);
	}, [agent]);

	return (
		<Box flexDirection="row" flexGrow={1}>
			<Box flexDirection="column">
				{Object.entries(status).map(([id, status]) => (
					<Text key={id}>{id}</Text>
				))}
			</Box>
			<Box flexDirection="column" flexGrow={1} paddingLeft={1}>
				{Object.entries(status).map(([id, status]) => (
					<Text key={id}>{status}</Text>
				))}
			</Box>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	render(<AgentMonitor agent={agent} />);
}
