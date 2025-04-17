import { BehaviorNode, BehaviorNodeStatus } from "../BehaviorNode";

export interface EnableToolsProps {
	tools: string[];
}

export class EnableTools extends BehaviorNode {
	readonly nodeType = "enable-tools";

	constructor(
		parent: BehaviorNode,
		id: string,
		private config: EnableToolsProps,
	) {
		super(parent, id);
	}

	protected async doTick(): Promise<BehaviorNodeStatus> {
		for (const tool of this.config.tools) {
			const [mcpId, toolName] = tool.split("::");

			if (!mcpId || !toolName) {
				throw new Error(`Invalid tool: ${tool}`);
			}

			const mcpClient = this.getBlackboard().getKey("__mcpClients")[mcpId];
			if (!mcpClient) {
				throw new Error(`MCP client not found: ${mcpId}`);
			}

			const toolImplementation = (await mcpClient.tools())[toolName];
			if (!toolImplementation) {
				throw new Error(`Tool not found: ${toolName}`);
			}

			this.getBlackboard().setKey("__tools", {
				...this.getBlackboard().getKey("__tools"),
				[toolName]: toolImplementation,
			});
		}

		return BehaviorNodeStatus.Success;
	}
}
