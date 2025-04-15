import type { BehaviorNodeStatus } from "./nodes";

export interface NodeStateChangedEvent {
	type: "nodeStateChange";
	node: string;
	fromState: BehaviorNodeStatus;
	toState: BehaviorNodeStatus;
}

export type Event = NodeStateChangedEvent;

type EventListener = (event: Event) => void;

export class EventLog {
	private events: Event[];
	private listeners: EventListener[];

	constructor() {
		this.events = [];
		this.listeners = [];
	}

	addEvent(event: Event) {
		this.events.push(event);
		for (const listener of this.listeners) {
			listener(event);
		}
	}

	addListener(listener: EventListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}
}
