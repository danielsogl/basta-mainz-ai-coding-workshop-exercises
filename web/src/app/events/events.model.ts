/** One row of `GET /events`. */
export interface TicketEvent {
  id: string;
  name: string;
  capacity: number;
  sold: number;
  available: number;
  soldOut: boolean;
}

/** Response of `POST /events/{id}/waitlist`. */
export interface WaitlistEntry {
  position: number;
  /** The API answers 200 instead of 201 when this email was already on the list (AC3). */
  alreadyOnList: boolean;
}

/** Response of `GET /events/{id}/waitlist`. */
export interface WaitlistInfo {
  eventId: string;
  length: number;
}
