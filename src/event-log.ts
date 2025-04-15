import type { BehaviorNodeStatus } from "./nodes";

export interface NodeStateChangedEvent {
	type: "nodeStateChange";
	node: string;
	fromState: BehaviorNodeStatus;
	toState: BehaviorNodeStatus;
}

export interface LogMessageEvent {
	type: "logMessage";
	message: string;
}

export type Event = NodeStateChangedEvent | LogMessageEvent;

type EventListener = (event: Event & { id: number }) => void;

export class EventLog {
	private events: (Event & { id: number })[];
	private listeners: EventListener[];

	constructor() {
		this.events = [];
		this.listeners = [];
	}

	addEvent(event: Event) {
		const id = this.events.length;
		this.events.push({ ...event, id } as Event & { id: number });
		for (const listener of this.listeners) {
			listener({ ...event, id } as Event & { id: number });
		}
	}

	addListener(listener: EventListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}
}
