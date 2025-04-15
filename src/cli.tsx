import { Box, render } from "ink";

import type { Agent } from "./agent";
import { useTerminalSize } from "./cli/use-terminal-size";
import { Panel } from "./cli/components/Panel";
import { TreeState } from "./cli/components/TreeState";
import { ActiveNodeView } from "./cli/components/ActiveNodeView";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	const { rows } = useTerminalSize();

	return (
		<Box flexDirection="row" height={rows}>
			<Panel title="Tree State" flexBasis={50} flexShrink={1}>
				<TreeState agent={agent} />
			</Panel>
			<Panel title="Active Nodes" flexGrow={1}>
				<ActiveNodeView agent={agent} />
			</Panel>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	render(<AgentMonitor agent={agent} />);
}
