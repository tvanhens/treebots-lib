import { useEffect, useState } from "react";
import terminalSize from "terminal-size";

export function useTerminalSize() {
	const [size, setSize] = useState(terminalSize());
	// biome-ignore lint/correctness/useExhaustiveDependencies(size): we want to run this once
	useEffect(() => {
		const interval = setInterval(() => {
			const { rows: oldRows, columns: oldColumns } = size;
			const { rows, columns } = terminalSize();
			if (oldRows !== rows || oldColumns !== columns) {
				setSize({ rows, columns });
			}
		}, 100);
		return () => clearInterval(interval);
	}, []);
	return size;
}
