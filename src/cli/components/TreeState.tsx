import { Box, Text } from "ink";

import { Status } from "./Status";
import type { Agent } from "../../agent";
import { useTreeState } from "../use-tree-state";

export function TreeState({ agent }: { agent: Agent }) {
	const state = useTreeState(agent);

	return (
		<Box flexDirection="column" paddingRight={1}>
			<Box flexDirection="row" flexGrow={1}>
				<Box flexDirection="column">
					{Object.entries(state).map(([id, { nestingLevel, nodeType }]) => (
						<Text key={id}>
							{`${" ".repeat(nestingLevel * 2)}${nodeType} (${id})`}
						</Text>
					))}
				</Box>
				<Box flexDirection="column" flexGrow={1} paddingLeft={1}>
					{Object.entries(state).map(([id, { status }]) => (
						<Status key={id} status={status} />
					))}
				</Box>
			</Box>
		</Box>
	);
}
