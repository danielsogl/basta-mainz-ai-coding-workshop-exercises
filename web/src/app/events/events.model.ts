/** One row of `GET /events`. */
export interface TicketEvent {
  id: number;
  name: string;
  capacity: number;
  sold: number;
  available: number;
  soldOut: boolean;
}
