import { useEffect, useState } from "react";
import type { Agent } from "../agent";
import type { Event } from "../event-log";

export function useEventLog(agent: Agent) {
	const [events, setEvents] = useState<Event[]>([]);

	useEffect(() => {
		const unsub = agent.getEventLog().addListener((event) => {
			setEvents((prev) => [...prev, event]);
		});
		return () => unsub();
	}, [agent]);

	return events;
}
