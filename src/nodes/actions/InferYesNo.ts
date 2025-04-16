import { streamText } from "ai";
import type { CoreMessage, LanguageModelV1 } from "ai";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";
import type { ExecutionContext } from "../../agent";

export interface InferYesNoNodeProps {
	model: LanguageModelV1;
}

/**
 * A node that infers a yes/no using a language model.
 * A yes response is a successful response.
 * A no response is a failure response.
 */
export class InferYesNoNode extends BehaviorNode {
	readonly nodeType = "infer-yes-no";

	text = "";

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: InferYesNoNodeProps,
	) {
		super(parent, id);
	}

	async enter(executionContext: ExecutionContext) {
		const messages = executionContext.blackboard.getKey(
			"messages",
		) as CoreMessage[];

		const stream = streamText({
			model: this.props.model,
			messages: [
				...messages,
				{
					role: "user",
					content:
						"Please give a <result>yes</result> or <result>no</result> answer wrapped in <result>.",
				},
				{ role: "assistant", content: "<result>" },
			],
			tools: executionContext.enabledTools,
			onStepFinish: (stepResult) => {
				executionContext.eventLog.addEvent({
					type: "logMessage",
					message: `Inferred yes/no: ${stepResult.text}`,
				});

				if (stepResult.text === "yes") {
					this.setState(BehaviorNodeStatus.Success);
				} else if (stepResult.text === "no") {
					this.setState(BehaviorNodeStatus.Failure);
				}
			},
			stopSequences: ["</result>"],
		});

		(async () => {
			for await (const chunk of stream.fullStream) {
				if (chunk.type === "error") {
					this.setState(BehaviorNodeStatus.Failure);
					console.error(chunk.error);
					return;
				}
			}
		})();
	}
}
