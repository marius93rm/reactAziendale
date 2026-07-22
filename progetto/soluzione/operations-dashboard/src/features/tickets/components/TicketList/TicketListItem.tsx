/** La riga rende un ticket e comunica la selezione al proprietario dello stato. */
import type { Ticket, TicketPriority, TicketStatus } from '../../ticket.types';

const statusLabels: Record<TicketStatus, string> = {
  nuovo: 'Nuovo',
  'in-lavorazione': 'In lavorazione',
  'in-attesa': 'In attesa',
  risolto: 'Risolto',
};

const priorityLabels: Record<TicketPriority, string> = {
  critica: 'Critica',
  alta: 'Alta',
  media: 'Media',
  bassa: 'Bassa',
};

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

type TicketListItemProps = {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
};

export function TicketListItem({
  ticket,
  isSelected,
  onSelect,
}: TicketListItemProps) {
  return (
    <button
      className="ticket-list__item"
      data-selected={isSelected}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(ticket.id)}
    >
      <span className="ticket-list__main">
        <span className="ticket-list__meta">
          <strong>{ticket.id}</strong>
          <span className="ticket-list__status" data-status={ticket.status}>
            {statusLabels[ticket.status]}
          </span>
        </span>
        <strong className="ticket-list__title">{ticket.title}</strong>
        <span className="ticket-list__customer">{ticket.customer}</span>
      </span>
      <span className="ticket-list__side">
        <span className="ticket-list__priority" data-priority={ticket.priority}>
          {priorityLabels[ticket.priority]}
        </span>
        <span>{ticket.assignee}</span>
        <time dateTime={ticket.updatedAt}>
          {dateFormatter.format(new Date(ticket.updatedAt))}
        </time>
      </span>
    </button>
  );
}
