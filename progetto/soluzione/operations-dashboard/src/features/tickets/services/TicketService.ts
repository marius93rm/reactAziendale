/** Il contratto descrive cosa serve alla feature, senza imporre una tecnologia. */
import type { Ticket, TicketFiltersValue } from '../ticket.types';

export interface TicketService {
  list(filters: TicketFiltersValue, signal: AbortSignal): Promise<Ticket[]>;
}
