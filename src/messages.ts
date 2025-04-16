import type { CoreMessage } from "ai";

export class MessageStore {
	private messages: CoreMessage[] = [];

	addMessage(message: CoreMessage) {
		this.messages.push(message);
	}

	getMessages() {
		return [...this.messages];
	}

	clearMessages() {
		this.messages = [];
	}
}
