import React, { useState, useEffect } from "react";
import { Box, render, Text } from "ink";

import type { Agent } from "./agent";
import { EventLogView } from "./cli/components/EventLogView";
import type { Event } from "./event-log";
import { useTerminalSize } from "./cli/use-terminal-size";
import { Panel } from "./cli/components/Panel";
import { TreeState } from "./cli/components/TreeState";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	const [events, setEvents] = useState<Event[]>([]);
	const { rows } = useTerminalSize();

	useEffect(() => {
		const unsub = agent.getEventLog().addListener((event) => {
			setEvents((prev) => [...prev, event]);
		});
		return () => unsub();
	}, [agent]);

	return (
		<Box flexDirection="row" height={rows}>
			<Panel title="Tree State" flexBasis={50} flexShrink={1}>
				<TreeState agent={agent} />
			</Panel>
			<Panel title="Log" flexGrow={1}>
				<EventLogView events={events} />
			</Panel>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	render(<AgentMonitor agent={agent} />);
}
