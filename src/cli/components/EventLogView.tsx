import { Box, Text } from "ink";

import type { Event } from "../../event-log";
import { Status } from "./status";
import type { Agent } from "../../agent";
import { useEventLog } from "../use-event-log";
import { generateText, type CoreMessage } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

function StatusChangeEvent({ event }: { event: Event }) {
	return (
		<Box gap={1} flexDirection="row">
			<Box flexDirection="row" justifyContent="flex-end">
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
	agent: Agent;
}

export function EventLogView({ agent }: EventLogProps) {
	const events = useEventLog(agent);

	return (
		<Box
			flexDirection="column"
			paddingLeft={1}
			paddingRight={1}
			height={"100%"}
			flexWrap="nowrap"
		>
			{events.map((event) => (
				<StatusChangeEvent key={event.id} event={event} />
			))}
		</Box>
	);
}

const messages: CoreMessage[] = [
	{
		role: "system",
		content: `
<instructions>
The user is asking you a yes or no question.
Respond with yes or no in the correct format.
</instructions>

<response-format>
<response>{yes|no}</response>
</response-format>
`,
	},
	{
		role: "user",
		content: "Is today Monday?",
	},
	{
		role: "assistant",
		content: "<response>",
	},
];

const response = await generateText({
	model: openrouter("openai/gpt-4o"),
	messages,
	stopSequences: ["</response>"],
});
