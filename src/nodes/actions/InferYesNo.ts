import { BehaviorNodeStatus, type BehaviorNode } from "../BehaviorNode";
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

	async doTick(): Promise<BehaviorNodeStatus> {
		if (this.getState() === BehaviorNodeStatus.Pending) {
			this.getBlackboard().setKey("__messages", [
				...this.getBlackboard().getKey("__messages"),
				{
					role: "system",
					content: "Please give a `yes` or `no` answer wrapped in `<result>`.",
				},
			]);
		}

		const state = await super.doTick();

		if (state === BehaviorNodeStatus.Running) {
			return BehaviorNodeStatus.Running;
		}

		this.text += "</result>";

		if (this.text.toLowerCase().includes("yes")) {
			return BehaviorNodeStatus.Success;
		}

		return BehaviorNodeStatus.Failure;
	}
}
