import { Box, Text } from "ink";

import { Status } from "./Status";
import type { Agent } from "../../agent";
import { useTreeState } from "../use-tree-state";
import { BehaviorNodeStatus } from "../../nodes";

export function TreeState({ agent }: { agent: Agent }) {
	const state = useTreeState(agent);

	return (
		<Box flexDirection="column" flexGrow={1}>
			{Object.entries(state)
				.filter(([_id, { shouldDisplay }]) => shouldDisplay)
				.map(
					([
						id,
						{ nestingLevel, nodeType, status, childrenCount, statusText },
					]) => (
						<Box key={id} flexDirection="row">
							<Box flexDirection="row" flexGrow={1} flexShrink={0}>
								<Box paddingLeft={(nestingLevel - 1) * 2} flexDirection="row">
									<Text wrap="truncate">{`${nodeType} `}</Text>
									<Text wrap="truncate">[{id}] </Text>
								</Box>

								<Box
									alignItems="flex-start"
									justifyContent="flex-end"
									marginLeft={1}
									flexGrow={1}
									gap={1}
								>
									<Status status={status} />
								</Box>
							</Box>
							<Box marginLeft={1} flexShrink={1} flexBasis={"75%"}>
								<Text dimColor wrap="truncate-start">
									{statusText}
								</Text>
							</Box>
						</Box>
					),
				)}
		</Box>
	);
}
