import { streamText, type Tool } from "ai";
import pino from "pino";

import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";
import { Agent } from "../../agent";

export type InferTextNodeProps = Omit<
	Parameters<typeof streamText>[0],
	"messages" | "tools" | "onStepFinish"
> & {
	tools?: string[];
};

/**
 * A node that infers a text using a language model.
 */
export class InferTextNode extends BehaviorNode {
	readonly nodeType: string = "infer-text";
	text: string;

	protected stream: ReturnType<typeof streamText> | undefined;
	protected streamDone = false;
	protected logger: pino.Logger | undefined;

	private tools: Record<string, Tool> | undefined;

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

	async doTick(): Promise<BehaviorNodeStatus> {
		const { tools: selectedTools, ...props } = this.props;

		if (!this.tools && selectedTools) {
			const tools: Record<string, Tool> = {};
			for (const tool of selectedTools) {
				const agent = Agent.getAgent(this);
				const toolName = tool.split("::")[1];
				if (!toolName) {
					throw new Error(`Invalid tool: ${tool}`);
				}
				tools[toolName] = await agent.getTool(tool);
			}
			this.tools = tools;
		}

		if (this.stream) {
			if (this.streamDone === true) {
				return BehaviorNodeStatus.Success;
			}

			return BehaviorNodeStatus.Running;
		}

		const messages = this.getBlackboard().getKey("__messages");

		this.stream = streamText({
			messages,
			tools: this.tools,
			onStepFinish: (stepResult) => {
				for (const message of stepResult.response.messages) {
					this.getBlackboard().setKey("__messages", [
						...this.getBlackboard().getKey("__messages"),
						message,
					]);
				}
				this.streamDone = true;

				this.logger?.info({
					event: "inference-step-finish",
					messages,
					response: stepResult.response,
				});

				this.getBlackboard().setKey(`__node_result.${this.id}`, {
					text: this.text,
				});
			},

			...props,
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
