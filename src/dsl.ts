import type { LanguageModelV1 } from "ai";
import {
	AddMessageNode,
	type BehaviorNode,
	InferTextNode,
	SequenceNode,
} from "./nodes";
import { EnableTools } from "./nodes/actions/EnableTool";
import { RepeatNode } from "./nodes/decorators/RepeatNode";

export interface NodeHandle {
	repeat: (maxTimes?: number) => NodeHandle;
}

export interface BodyScope {
	messages: {
		user: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		assistant: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		system: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
	};

	infer: {
		text: (id: string, model: LanguageModelV1) => NodeHandle;
	};

	tools: {
		enable: (tools: string[]) => NodeHandle;
	};

	control: {
		sequence: (id: string, body: (ctx: BodyScope) => void) => NodeHandle;
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
	let messageId = 0;

	const scope: BodyScope = {
		messages: {
			user: (parts, ...args) => {
				const node = new AddMessageNode(parent, `user-${messageId}`, {
					role: "user",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
				return makeNodeHandle(node);
			},
			assistant: (parts, ...args) => {
				const node = new AddMessageNode(parent, `assistant-${messageId}`, {
					role: "assistant",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
				return makeNodeHandle(node);
			},
			system: (parts, ...args) => {
				const node = new AddMessageNode(parent, `system-${messageId}`, {
					role: "system",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
				return makeNodeHandle(node);
			},
		},
		tools: {
			enable: (tools) => {
				const node = new EnableTools(parent, `enable-${messageId}`, {
					tools,
				});
				messageId++;
				return makeNodeHandle(node);
			},
		},
		infer: {
			text: (id, model) => {
				const node = new InferTextNode(parent, id, { model });
				return makeNodeHandle(node);
			},
		},
		control: {
			sequence: (id, body) => {
				const node = new SequenceNode(parent, id);
				body(buildScope(node));
				return makeNodeHandle(node);
			},
		},
	};
	return scope;
}
