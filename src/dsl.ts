import type { LanguageModelV1 } from "ai";
import {
	AddMessageNode,
	type BehaviorNode,
	InferTextNode,
	SequenceNode,
} from "./nodes";
import { EnableTools } from "./nodes/actions/EnableTool";
import { RepeatNode } from "./nodes/decorators/RepeatNode";
import { ClearMessagesNode } from "./nodes/actions/ClearMessagesNode";
import { InferYesNoNode } from "./nodes/actions/InferYesNo";

let id = 0;

export interface NodeHandle {
	repeat: (maxTimes?: number) => NodeHandle;
}

export interface BodyScope {
	messages: {
		user: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		assistant: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		system: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		clear: () => NodeHandle;
	};

	infer: {
		text: (model: LanguageModelV1) => NodeHandle;
		yesNo: (model: LanguageModelV1) => NodeHandle;
	};

	tools: {
		enable: (tools: string[]) => NodeHandle;
	};

	control: {
		sequence: (body: (ctx: BodyScope) => void) => NodeHandle;
	};
}

export function makeNodeHandle(node: BehaviorNode): NodeHandle {
	return {
		repeat: (maxTimes?: number) => {
			const parent = node.parent;
			if (!parent) {
				throw new Error("Parent node not found");
			}
			const repeatNode = new RepeatNode(parent, "repeat", { maxTimes });
			parent.removeChild(node);
			repeatNode.addChild(node);
			return makeNodeHandle(repeatNode);
		},
	};
}

export function buildScope(parent: BehaviorNode): BodyScope {
	const scope: BodyScope = {
		messages: {
			user: (parts, ...args) => {
				const node = new AddMessageNode(parent, `user-${id}`, {
					role: "user",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				id++;
				return makeNodeHandle(node);
			},
			assistant: (parts, ...args) => {
				const node = new AddMessageNode(parent, `assistant-${id}`, {
					role: "assistant",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				id++;
				return makeNodeHandle(node);
			},
			system: (parts, ...args) => {
				const node = new AddMessageNode(parent, `system-${id}`, {
					role: "system",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				id++;
				return makeNodeHandle(node);
			},
			clear: () => {
				const node = new ClearMessagesNode(parent, `clear-${id}`);
				id++;
				return makeNodeHandle(node);
			},
		},
		tools: {
			enable: (tools) => {
				const node = new EnableTools(parent, `enable-${id}`, {
					tools,
				});
				id++;
				return makeNodeHandle(node);
			},
		},
		infer: {
			text: (model) => {
				const node = new InferTextNode(parent, `infer-${id}`, { model });
				id++;
				return makeNodeHandle(node);
			},

			yesNo: (model) => {
				const node = new InferYesNoNode(parent, `infer-${id}`, { model });
				id++;
				return makeNodeHandle(node);
			},
		},
		control: {
			sequence: (body) => {
				const node = new SequenceNode(parent, `sequence-${id}`);
				id++;
				body(buildScope(node));
				return makeNodeHandle(node);
			},
		},
	};
	return scope;
}
