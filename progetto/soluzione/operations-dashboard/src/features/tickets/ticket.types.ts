/** I tipi definiscono il vocabolario condiviso dalla feature tickets. */
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

export type TicketFiltersValue = {
  query: string;
  status: TicketStatusFilter;
};

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
