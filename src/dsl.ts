import type { LanguageModelV1 } from "ai";
import {
	AddMessageNode,
	type BehaviorNode,
	InferTextNode,
	type InferTextNodeProps,
	SequenceNode,
} from "./nodes";
import { RepeatNode } from "./nodes/decorators/RepeatNode";
import { ClearMessagesNode } from "./nodes/actions/ClearMessagesNode";
import { InferYesNoNode } from "./nodes/actions/InferYesNo";
import { WaitNode } from "./nodes/actions/WaitNode";
import { FallbackNode } from "./nodes/composites/Fallback";
import { LogMessage } from "./nodes/actions/LogMessage";

let id = 0;

export interface NodeHandle {
	id: string;
	repeat: (maxTimes?: number) => NodeHandle;
	$: (...keys: string[]) => () => unknown;
}

export interface BodyScope {
	messages: {
		user: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		assistant: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		system: (parts: TemplateStringsArray, ...args: string[]) => NodeHandle;
		clear: () => NodeHandle;
	};

	infer: {
		text: (
			model: LanguageModelV1,
			props?: Omit<InferTextNodeProps, "model">,
		) => NodeHandle;
		yesNo: (model: LanguageModelV1) => NodeHandle;
	};

	util: {
		log: (
			parts: TemplateStringsArray,
			...args: (string | (() => unknown))[]
		) => NodeHandle;
	};

	control: {
		sequence: (body: (ctx: BodyScope) => void) => NodeHandle;
		fallback: (body: (ctx: BodyScope) => void) => NodeHandle;
		wait: (duration: number) => NodeHandle;
	};
}

export function makeNodeHandle(node: BehaviorNode): NodeHandle {
	return {
		id: node.id,
		$: (...keys: string[]) => {
			return () => {
				const result = node.getBlackboard().getKey(`__node_result.${node.id}`);
				if (keys.length === 0) {
					return result;
				}
				return keys.reduce((acc, key) => {
					if (typeof acc === "object" && acc !== null && key in acc) {
						return (acc as Record<string, unknown>)[key];
					}
					return acc;
				}, result as unknown);
			};
		},
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
					message: preprocessTemplate(parts, ...args),
				});
				id++;
				return makeNodeHandle(node);
			},
			assistant: (parts, ...args) => {
				const node = new AddMessageNode(parent, `assistant-${id}`, {
					role: "assistant",
					message: preprocessTemplate(parts, ...args),
				});
				id++;
				return makeNodeHandle(node);
			},
			system: (parts, ...args) => {
				const node = new AddMessageNode(parent, `system-${id}`, {
					role: "system",
					message: preprocessTemplate(parts, ...args),
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
		infer: {
			text: (model, props) => {
				const node = new InferTextNode(parent, `infer-${id}`, {
					model,
					...props,
				});
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
			fallback: (body) => {
				const node = new FallbackNode(parent, `fallback-${id}`);
				id++;
				body(buildScope(node));
				return makeNodeHandle(node);
			},
			wait: (duration) => {
				const node = new WaitNode(parent, `wait-${id}`, {
					durationInMilliseconds: duration,
				});
				id++;
				return makeNodeHandle(node);
			},
		},
		util: {
			log: (parts, ...args) => {
				const message = preprocessTemplate(parts, ...args);
				const node = new LogMessage(parent, `log-${id}`, { message });
				id++;
				return makeNodeHandle(node);
			},
		},
	};
	return scope;
}

function preprocessTemplate(
	parts: TemplateStringsArray,
	...args: (string | (() => unknown))[]
): () => string {
	return () => {
		const result = parts.reduce((acc, part, i) => {
			const template = args[i];
			if (typeof template === "function") {
				return acc + part + template();
			}
			return acc + part + (template ?? "");
		}, "");

		const lines = result.split("\n");
		if (lines.length === 0) return "";

		// Find the indentation level of the first non-empty line
		const firstNonEmptyLine = lines.find((line) => line.trim().length > 0);
		if (!firstNonEmptyLine) return "";

		const firstLineMatch = firstNonEmptyLine.match(/^\s*/);
		const firstLineIndent = firstLineMatch ? firstLineMatch[0].length : 0;

		// De-indent all lines by the first line's indentation level
		return lines
			.map((line) => line.slice(firstLineIndent))
			.join("\n")
			.trim();
	};
}
