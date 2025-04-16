import { Box, Text } from "ink";

import { Status } from "./Status";
import type { Agent } from "../../agent";
import { useTreeState } from "../use-tree-state";
import { BehaviorNodeStatus } from "../../nodes";

export function TreeState({ agent }: { agent: Agent }) {
	const state = useTreeState(agent);

	return (
		<Box flexDirection="column">
			{Object.entries(state)
				.filter(([_id, { shouldDisplay }]) => shouldDisplay)
				.filter(([_id, { nodeType }]) =>
					[
						"sequence",
						"fallback",
						"wait",
						"infer-text",
						"infer-yes-no",
					].includes(nodeType),
				)
				.map(([id, { nestingLevel, nodeType, status, childrenCount }]) => (
					<Box key={id} flexDirection="row">
						<Box paddingLeft={(nestingLevel - 1) * 2} flexDirection="row">
							<Text wrap="truncate">{`${nodeType} `}</Text>
							<Text wrap="truncate">[{id}] </Text>
						</Box>

						<Box
							alignItems="flex-end"
							justifyContent="flex-end"
							marginLeft={1}
							flexGrow={1}
						>
							{["sequence", "fallback", "repeat"].includes(nodeType) && (
								<Box marginRight={1}>
									{status !== BehaviorNodeStatus.Running && (
										<Text dimColor>({childrenCount} children)</Text>
									)}
								</Box>
							)}
							<Status status={status} />
						</Box>
					</Box>
				))}
		</Box>
	);
}
