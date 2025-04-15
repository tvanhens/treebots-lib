import {
	AddMessageNode,
	type AddMessageNodeProps,
	type BehaviorNode,
	InferTextNode,
	type InferTextNodeProps,
	SequenceNode,
} from "./nodes";
import { EnableTools, type EnableToolsProps } from "./nodes/actions/EnableTool";

export interface BodyScope {
	sequence: (id: string, body: (ctx: BodyScope) => void) => void;
	inferText: (id: string, args: InferTextNodeProps) => void;
	addMessage: (id: string, args: AddMessageNodeProps) => void;
	enableTools: (id: string, args: EnableToolsProps) => void;
}

export function buildScope(parent: BehaviorNode): BodyScope {
	const scope: BodyScope = {
		sequence: (id, body) => {
			const node = new SequenceNode(parent, id);
			body(buildScope(node));
		},
		inferText: (id, args) => {
			return new InferTextNode(parent, id, args);
		},
		addMessage: (id, args) => {
			return new AddMessageNode(parent, id, args);
		},
		enableTools: (id, args) => {
			return new EnableTools(parent, id, args);
		},
	};
	return scope;
}
