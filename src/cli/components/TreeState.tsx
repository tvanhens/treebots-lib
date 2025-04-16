import { Box, Text } from "ink";

import { Status } from "./Status";
import type { Agent } from "../../agent";
import { useTreeState } from "../use-tree-state";
import { emojify, get } from "node-emoji";

function toEmoji(nodeType: string) {
	switch (nodeType) {
		default:
			return get("arrow_right");
	}
}

export function TreeState({ agent }: { agent: Agent }) {
	const state = useTreeState(agent);

	return (
		<Box flexDirection="column">
			{Object.entries(state).map(([id, { nestingLevel, nodeType, status }]) => (
				<Box key={id} flexDirection="row">
					<Box
						paddingLeft={(nestingLevel - 1) * 2}
						flexBasis={"25%"}
						flexDirection="row"
					>
						<Text>{`[${nodeType}] `}</Text>
						<Text wrap="truncate">{`${id}`}</Text>
					</Box>
					<Box flexBasis={"5%"}>
						<Status status={status} />
					</Box>
				</Box>
			))}
		</Box>
	);
}
