import { Box, render } from "ink";

import type { Agent } from "./agent";
import { Panel } from "./cli/components/Panel";
import { TreeState } from "./cli/components/TreeState";
import { LogView } from "./cli/components/LogView";

const AgentMonitor = ({ agent }: { agent: Agent }) => {
	return (
		<Box flexDirection="column" flexGrow={1} height={30}>
			<Panel title="Tree State" flexShrink={0} flexGrow={1}>
				<TreeState agent={agent} />
			</Panel>
		</Box>
	);
};

export function monitorAgent(agent: Agent) {
	console.log("\x1b[2J");
	render(<AgentMonitor agent={agent} />, { patchConsole: false });
}
