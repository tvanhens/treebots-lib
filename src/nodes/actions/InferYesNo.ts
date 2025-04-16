import type { CoreMessage } from "ai";

import { BehaviorNodeStatus, type BehaviorNode } from "../BehaviorNode";
import type { ExecutionContext } from "../../agent";
import { InferTextNode, type InferTextNodeProps } from "./InferTextNode";

export type InferYesNoNodeProps = Pick<InferTextNodeProps, "model">;

/**
 * A node that infers a yes/no using a language model.
 * A yes response is a successful response.
 * A no response is a failure response.
 */
export class InferYesNoNode extends InferTextNode {
	readonly nodeType: string = "infer-yes-no";

	constructor(parent: BehaviorNode, id: string, props: InferYesNoNodeProps) {
		super(parent, id, {
			model: props.model,
			stopSequences: ["</result>"],
		});
	}

	async doTick(
		executionContext: ExecutionContext,
	): Promise<BehaviorNodeStatus> {
		if (this.getState() === BehaviorNodeStatus.Pending) {
			executionContext.blackboard.updateState({
				messages: [
					...(executionContext.blackboard.getKey("messages") as CoreMessage[]),
					{
						role: "user",
						content:
							"Please give a <result>yes</result> or <result>no</result> answer wrapped in <result>.",
					},
					{ role: "assistant", content: "<result>" },
				],
			});
		}

		const state = await super.doTick(executionContext);

		if (state === BehaviorNodeStatus.Running) {
			return BehaviorNodeStatus.Running;
		}

		if (this.text.toLowerCase().includes("yes")) {
			executionContext.eventLog.addEvent({
				type: "logMessage",
				message: `${this.id} - yes response received.`,
			});
			return BehaviorNodeStatus.Success;
		}

		executionContext.eventLog.addEvent({
			type: "logMessage",
			message: `[${this.id}] yes/no returned ${this.text}`,
		});
		return BehaviorNodeStatus.Failure;
	}
}
