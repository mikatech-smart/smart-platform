import { MiKAOS } from "../core/mika-os";
import { createBusinessContext } from "../core/context/business-context";

const os = new MiKAOS();

export function generateExecutiveBriefing() {
  const context = createBusinessContext();

  const recommendations = os.analyze(context);

  return recommendations[0];
}