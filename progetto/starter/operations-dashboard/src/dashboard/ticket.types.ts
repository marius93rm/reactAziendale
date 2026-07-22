/**
 * I tipi descrivono il vocabolario del dominio assistenza.
 * Le union impediscono di usare stati o priorità non previsti.
 */
export type TicketStatus =
  | 'nuovo'
  | 'in-lavorazione'
  | 'in-attesa'
  | 'risolto';

export type TicketPriority = 'critica' | 'alta' | 'media' | 'bassa';

export type Ticket = {
  id: string;
  title: string;
  customer: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  updatedAt: string;
};

export type TicketStatusFilter = TicketStatus | 'tutti';

