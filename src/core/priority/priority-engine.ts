import { AgentResponse } from "../types";

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

export function sortRecommendations(
  recommendations: AgentResponse[]
): AgentResponse[] {

  return recommendations.sort(
    (a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
  );

}