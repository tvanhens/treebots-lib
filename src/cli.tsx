import { Box, render } from "ink";

import type { Agent } from "./agent";
import { EventLogView } from "./cli/components/EventLogView";
import { useTerminalSize } from "./cli/use-terminal-size";
import { Panel } from "./cli/components/Panel";
import { TreeState } from "./cli/components/TreeState";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	const { rows } = useTerminalSize();

	return (
		<Box flexDirection="row" height={rows}>
			<Panel title="Tree State" flexBasis={50} flexShrink={1}>
				<TreeState agent={agent} />
			</Panel>
			<Panel title="Log" flexGrow={1}>
				<EventLogView agent={agent} />
			</Panel>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	render(<AgentMonitor agent={agent} />);
}
