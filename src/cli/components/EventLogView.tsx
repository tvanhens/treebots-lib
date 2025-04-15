import { Box, Text } from "ink";

import type { Event } from "../../event-log";
import { Status } from "./status";
import useStdoutDimensions from "ink-use-stdout-dimensions";

function StatusChangeEvent({ event }: { event: Event }) {
	return (
		<Box gap={1} flexDirection="row">
			<Box flexDirection="row" flexBasis={"10%"} justifyContent="flex-end">
				<Box>
					<Text>[</Text>
				</Box>
				<Box>
					<Text wrap="truncate-end">{event.node}</Text>
				</Box>
				<Box>
					<Text>]</Text>
				</Box>
			</Box>
			<Box>
				<Status status={event.fromState} />
				<Text>→</Text>
				<Status status={event.toState} />
			</Box>
		</Box>
	);
}

export interface EventLogProps {
	events: Event[];
}

export function EventLogView({ events }: EventLogProps) {
	return (
		<Box
			flexDirection="column"
			paddingLeft={1}
			paddingRight={1}
			flexGrow={1}
			height={"100%"}
		>
			{events.map((event) => (
				<StatusChangeEvent key={event.node} event={event} />
			))}
		</Box>
	);
}
