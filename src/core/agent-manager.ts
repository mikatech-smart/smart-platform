import { AgentResponse, BusinessContext } from "./types";

export interface Agent {
  name: string;

  execute(
    context: BusinessContext
  ): AgentResponse | null;
}

export class AgentManager {
  private agents: Agent[] = [];

  register(agent: Agent) {
    this.agents.push(agent);
  }

  execute(context: BusinessContext): AgentResponse[] {
    return this.agents
      .map((agent) => agent.execute(context))
      .filter(
        (response): response is AgentResponse =>
          response !== null
      );
  }
}