import { Box, Text } from "ink";
import { BehaviorNodeStatus } from "../../nodes";

interface StatusProps {
	status: BehaviorNodeStatus;
}

function getStatusColor(status: BehaviorNodeStatus) {
	switch (status) {
		case BehaviorNodeStatus.Success:
			return "green";
		case BehaviorNodeStatus.Failure:
			return "red";
		case BehaviorNodeStatus.Running:
			return "yellow";
		case BehaviorNodeStatus.Pending:
			return "gray";
	}
}

export function Status({ status }: StatusProps) {
	return <Text color={getStatusColor(status)}>{status}</Text>;
}
