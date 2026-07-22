/** L'API pubblica espone soltanto ciò che serve fuori dalla feature. */
export { TicketDashboardContainer } from './containers/TicketDashboardContainer';
export type {
  Ticket,
  TicketFiltersValue,
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
export type { TicketService } from './services/TicketService';
