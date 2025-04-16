import { streamText } from "ai";
import pino from "pino";

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
	protected logger: pino.Logger | undefined;
	constructor(
		parent: BehaviorNode,
		id: string,
		private props: InferTextNodeProps,
	) {
		super(parent, id);
		this.text = "";

		const debugLogDestination = process.env.DEBUG_LOGS;
		if (debugLogDestination) {
			this.logger = pino({
				transport: {
					target: "pino-pretty",
					options: {
						destination: ".inference.logs",
						colorize: false,
					},
				},
			});
		}
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

		const messages = [...executionContext.messageStore.getMessages()];

		this.stream = streamText({
			messages,
			tools: executionContext.enabledTools,
			onStepFinish: (stepResult) => {
				for (const message of stepResult.response.messages) {
					executionContext.messageStore.addMessage(message);
				}
				this.streamDone = true;

				this.logger?.info({
					event: "inference-step-finish",
					messages,
					response: stepResult.response,
				});

				executionContext.blackboard.saveResult(this, {
					text: this.text,
				});
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
					this.statusText = this.text;
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
