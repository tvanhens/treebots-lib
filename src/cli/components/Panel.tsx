import { Box, Text, type BoxProps } from "ink";

export interface PanelProps extends BoxProps {
	title: string;
	children: React.ReactNode;
}

export function Panel({ title, children, ...props }: PanelProps) {
	return (
		<Box flexDirection="column" borderStyle="single" {...props}>
			<Box
				flexDirection="row"
				width={"100%"}
				borderStyle="single"
				borderTop={false}
				borderLeft={false}
				borderRight={false}
				paddingLeft={1}
				paddingRight={1}
				flexShrink={0}
			>
				<Text bold color={"white"}>
					{title}
				</Text>
			</Box>
			<Box paddingBottom={1}>{children}</Box>
		</Box>
	);
}
