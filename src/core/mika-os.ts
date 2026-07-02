import { AgentManager } from "./agent-manager";
import { BusinessContext } from "./types";

import { CEOAgent } from "../agents/ceo/ceo-agent";

export class MiKAOS {

  private manager = new AgentManager();

  constructor() {

    this.manager.register(
      new CEOAgent()
    );

  }

  analyze(
    context: BusinessContext
  ) {
    return this.manager.execute(context);
  }

}