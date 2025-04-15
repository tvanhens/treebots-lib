import { Box, Text } from "ink";
import type { BehaviorNode } from "../../nodes/BehaviorNode";
import { InferTextNode } from "../../nodes";
import { useEffect, useState } from "react";

function useNodeWatcher<T extends BehaviorNode>(node: T) {
	const [state, setState] = useState<T>(node);

	useEffect(() => {
		setInterval(() => {
			setState(node);
		}, 200);
	}, [node]);

	return state;
}

export function InferTextNodeState({ node }: { node: InferTextNode }) {
	const state = useNodeWatcher(node);

	return (
		<Box gap={1} flexDirection="row">
			<Box flexBasis={"10%"}>
				<Text>{state.id}</Text>
			</Box>
			<Box width={"100%"}>
				<Text wrap="truncate-start">{state.text}</Text>
			</Box>
		</Box>
	);
}

export function NodeState({ node }: { node: BehaviorNode }) {
	if (node instanceof InferTextNode) {
		return <InferTextNodeState node={node} />;
	}

	return <></>;
}
