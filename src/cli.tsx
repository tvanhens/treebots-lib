import { Box, render } from "ink";

import type { Agent } from "./agent";
import { useTerminalSize } from "./cli/use-terminal-size";
import { Panel } from "./cli/components/Panel";
import { TreeState } from "./cli/components/TreeState";
import { LogView } from "./cli/components/LogView";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	const { rows } = useTerminalSize();

	return (
		<Box flexDirection="row" height={rows}>
			<Panel title="Tree State" flexShrink={0}>
				<TreeState agent={agent} />
			</Panel>
			<Panel title="Log" flexGrow={1}>
				<LogView agent={agent} />
			</Panel>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	render(<AgentMonitor agent={agent} />);
}
