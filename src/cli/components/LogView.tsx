import { useState, useEffect } from "react";
import type { Event } from "../../event-log";
import type { Agent } from "../../agent";
import { Box, Text } from "ink";
export interface LogViewProps {
	agent: Agent;
}

export function LogView({ agent }: LogViewProps) {
	const [logs, setLogs] = useState<(Event & { id: number })[]>([]);

	useEffect(() => {
		const logStream = agent.getEventLog().addListener((event) => {
			setLogs((prevLogs) => [...prevLogs, event]);
		});

		return () => {
			logStream();
		};
	}, [agent]);

	return (
		<Box flexDirection="column">
			{logs.map((log) => {
				if (log.type === "logMessage") {
					return (
						<Text key={log.id} wrap="truncate-end">
							{log.message}
						</Text>
					);
				}
			})}
		</Box>
	);
}
