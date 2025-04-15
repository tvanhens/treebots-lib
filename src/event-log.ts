import type { BehaviorNodeStatus } from "./nodes";

export interface NodeStateChangedEvent {
	id: number;
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

	addEvent(event: Omit<Event, "id">) {
		const id = this.events.length;
		this.events.push({ ...event, id });
		for (const listener of this.listeners) {
			listener({ ...event, id });
		}
	}

	addListener(listener: EventListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}
}
