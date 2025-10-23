import type { StatusStrategy } from "../../discount.strategy";

type StatusKey = string; // can be "active" | "draft" | "paused" | etc.
type StatusStrategyProvider = () => StatusStrategy;

export class StatusStrategyFactory {
  private readonly providers: Record<StatusKey, StatusStrategyProvider>;

  constructor(providers: Record<StatusKey, StatusStrategyProvider>) {
    this.providers = providers;
  }

  get(status: StatusKey): StatusStrategy {
    const provider = this.providers[status];
    if (!provider) {
      throw new Error(`No strategy registered for status "${status}"`);
    }
    return provider();
  }
}


