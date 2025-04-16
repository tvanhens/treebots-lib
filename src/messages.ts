import type { CoreMessage } from "ai";

export class MessageStore {
	private messages: CoreMessage[];

	constructor(messages?: CoreMessage[]) {
		this.messages = messages ?? [];
	}

	addMessage(message: CoreMessage) {
		this.messages.push(message);
	}

	getMessages() {
		return [...this.messages];
	}

	clearMessages() {
		this.messages = [];
	}

	fork() {
		return new MessageStore([...this.messages]);
	}
}
