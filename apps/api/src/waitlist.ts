/**
 * In-memory waitlists for sold-out events (docs/waitlist/spec.md).
 * Positions are 1-based and handed out in join order.
 */
export class Waitlists {
  readonly #byEvent = new Map<string, Map<string, number>>();

  /** Adds `email` to the event's waitlist. Joining twice returns the existing position. */
  join(eventId: string, email: string): { position: number; created: boolean } {
    let entries = this.#byEvent.get(eventId);
    if (!entries) {
      entries = new Map();
      this.#byEvent.set(eventId, entries);
    }
    const existing = entries.get(email);
    if (existing !== undefined) return { position: existing, created: false };
    const position = entries.size + 1;
    entries.set(email, position);
    return { position, created: true };
  }

  length(eventId: string): number {
    return this.#byEvent.get(eventId)?.size ?? 0;
  }
}
