import { Agent } from "../../core/agent-manager";
import {
  AgentResponse,
  BusinessContext,
} from "../../core/types";

export class CEOAgent implements Agent {
  name = "CEO Agent";

  execute(
    context: BusinessContext
  ): AgentResponse | null {

    if (context.businessScore < 40) {
      return {
        agent: this.name,
        title: "Sua empresa precisa de atenção",
        message:
          "Seu Business Score está baixo. Priorize a configuração dos módulos essenciais para fortalecer sua presença digital.",
        priority: "high",
      };
    }

    if (context.businessScore < 70) {
      return {
        agent: this.name,
        title: "Há oportunidades de crescimento",
        message:
          "Sua empresa está evoluindo, mas ainda existem recursos que podem aumentar seus resultados.",
        priority: "medium",
      };
    }

    return {
      agent: this.name,
      title: "Parabéns!",
      message:
        "Sua empresa apresenta uma boa saúde digital. Continue acompanhando os indicadores para manter o crescimento.",
      priority: "low",
    };
  }
}