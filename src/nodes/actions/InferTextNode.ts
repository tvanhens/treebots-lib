import { streamText } from "ai";
import type { CoreMessage, LanguageModelV1 } from "ai";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";
import type { ExecutionContext } from "../../agent";

interface InferTextNodeProps {
	model: LanguageModelV1;
}

/**
 * A node that infers a text using a language model.
 */
export class InferTextNode extends BehaviorNode {
	text: string;

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: InferTextNodeProps,
	) {
		super(parent, id);
		this.text = "";
	}

	async enter(executionContext: ExecutionContext) {
		this.text = "";

		const messages = executionContext.blackboard.getKey(
			"messages",
		) as CoreMessage[];

		const stream = streamText({
			model: this.props.model,
			messages,
		});

		(async () => {
			for await (const chunk of stream.fullStream) {
				if (chunk.type === "text-delta") {
					this.text += chunk.textDelta;
				}

				if (chunk.type === "error") {
					this.setState(BehaviorNodeStatus.Failure);
					console.error(chunk.error);
					return;
				}

				if (chunk.type === "finish") {
					executionContext.blackboard.updateState({
						messages: [
							...(executionContext.blackboard.getKey(
								"messages",
							) as CoreMessage[]),
							{
								role: "assistant",
								content: this.text,
							},
						],
					});
					this.setState(BehaviorNodeStatus.Success);
				}
			}
		})();
	}
}
