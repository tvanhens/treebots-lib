import type { LanguageModelV1 } from "ai";
import {
	AddMessageNode,
	type BehaviorNode,
	InferTextNode,
	SequenceNode,
} from "./nodes";
import { EnableTools } from "./nodes/actions/EnableTool";

export interface BodyScope {
	messages: {
		user: (parts: TemplateStringsArray, ...args: string[]) => void;
		assistant: (parts: TemplateStringsArray, ...args: string[]) => void;
		system: (parts: TemplateStringsArray, ...args: string[]) => void;
	};

	infer: {
		text: (id: string, model: LanguageModelV1) => void;
	};

	tools: {
		enable: (tools: string[]) => void;
	};

	control: {
		sequence: (id: string, body: (ctx: BodyScope) => void) => void;
	};
}

export function buildScope(parent: BehaviorNode): BodyScope {
	let messageId = 0;

	const scope: BodyScope = {
		messages: {
			user: (parts, ...args) => {
				new AddMessageNode(parent, `user-${messageId}`, {
					role: "user",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
			},
			assistant: (parts, ...args) => {
				new AddMessageNode(parent, `assistant-${messageId}`, {
					role: "assistant",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
			},
			system: (parts, ...args) => {
				new AddMessageNode(parent, `system-${messageId}`, {
					role: "system",
					message: parts.reduce((acc, part, i) => {
						return acc + part + (args[i] ?? "");
					}, ""),
				});
				messageId++;
			},
		},
		tools: {
			enable: (tools) => {
				new EnableTools(parent, `enable-${messageId}`, { tools });
				messageId++;
			},
		},
		infer: {
			text: (id, model) => {
				return new InferTextNode(parent, id, { model });
			},
		},
		control: {
			sequence: (id, body) => {
				const node = new SequenceNode(parent, id);
				body(buildScope(node));
			},
		},
	};
	return scope;
}
