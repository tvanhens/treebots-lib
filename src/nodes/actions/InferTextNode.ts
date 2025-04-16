import { streamText } from "ai";
import type { CoreMessage } from "ai";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";
import type { ExecutionContext } from "../../agent";

export type InferTextNodeProps = Omit<
	Parameters<typeof streamText>[0],
	"messages" | "tools" | "onStepFinish"
>;

/**
 * A node that infers a text using a language model.
 */
export class InferTextNode extends BehaviorNode {
	readonly nodeType: string = "infer-text";
	text: string;

	protected stream: ReturnType<typeof streamText> | undefined;
	protected streamDone = false;

	constructor(
		parent: BehaviorNode,
		id: string,
		private props: InferTextNodeProps,
	) {
		super(parent, id);
		this.text = "";
	}

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		if (this.stream) {
			if (this.streamDone === true) {
				return BehaviorNodeStatus.Success;
			}

			return BehaviorNodeStatus.Running;
		}

		const messages = executionContext.blackboard.getKey(
			"messages",
		) as CoreMessage[];

		this.stream = streamText({
			messages,
			tools: executionContext.enabledTools,
			onStepFinish: (stepResult) => {
				executionContext.blackboard.updateState({
					messages: [
						...(executionContext.blackboard.getKey(
							"messages",
						) as CoreMessage[]),
						...stepResult.response.messages,
					],
				});
				this.streamDone = true;
			},
			...this.props,
		});

		(async () => {
			if (!this.stream) {
				return;
			}

			for await (const chunk of this.stream.fullStream) {
				if (chunk.type === "text-delta") {
					this.text += chunk.textDelta;
				}

				if (chunk.type === "error") {
					throw chunk.error;
				}

				if (chunk.type === "tool-call") {
					executionContext.eventLog.addEvent({
						type: "logMessage",
						message: `[${this.id}] Tool called: ${chunk.toolName}`,
					});
				}
			}
		})();

		return BehaviorNodeStatus.Running;
	}

	reset(): void {
		this.text = "";
		this.streamDone = false;
		this.stream = undefined;
		super.reset();
	}
}
