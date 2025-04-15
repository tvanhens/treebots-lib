import { streamText } from "ai";
import type { CoreMessage, LanguageModelV1 } from "ai";

import { BehaviorNode, BehaviorNodeStatus } from "./BehaviorNode";
import type { ExecutionContext } from "../agent";

interface InferTextNodeProps {
	model: LanguageModelV1;
}

export class InferTextNode extends BehaviorNode {
	constructor(
		parent: BehaviorNode,
		id: string,
		private props: InferTextNodeProps,
	) {
		super(parent, id);
	}

	async enter(executionContext: ExecutionContext) {
		const messages = executionContext.blackboard.getKey(
			"messages",
		) as CoreMessage[];

		const stream = streamText({
			model: this.props.model,
			messages,
		});

		let text = "";

		(async () => {
			for await (const chunk of stream.fullStream) {
				if (chunk.type === "text-delta") {
					text += chunk.textDelta;
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
								content: text,
							},
						],
					});
					this.setState(BehaviorNodeStatus.Success);
				}
			}
		})();
	}
}
