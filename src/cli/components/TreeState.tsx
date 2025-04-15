import { Box, Text } from "ink";
import { Status } from "./status";
import type { Agent } from "../../agent";
import { useTreeState } from "../use-tree-state";

export function TreeState({ agent }: { agent: Agent }) {
	const state = useTreeState(agent);

	return (
		<Box flexDirection="column" paddingLeft={1} paddingRight={1}>
			<Box flexDirection="row" flexGrow={1}>
				<Box flexDirection="column">
					{Object.entries(state).map(([id, status]) => (
						<Text key={id}>{id}</Text>
					))}
				</Box>
				<Box flexDirection="column" flexGrow={1} paddingLeft={1}>
					{Object.entries(state).map(([id, status]) => (
						<Status key={id} status={status} />
					))}
				</Box>
			</Box>
		</Box>
	);
}
