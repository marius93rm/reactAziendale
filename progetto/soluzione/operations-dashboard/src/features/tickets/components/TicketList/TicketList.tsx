/**
 * TicketList gestisce l'identità della collezione e delega la singola riga.
 * La key usa l'id di dominio, quindi resta stabile durante filtri e riordini.
 */
import type { Ticket } from '../../ticket.types';
import { TicketListItem } from './TicketListItem';
import './TicketList.scss';

type TicketListProps = {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelect: (ticketId: string) => void;
};

export function TicketList({
  tickets,
  selectedTicketId,
  onSelect,
}: TicketListProps) {
  return (
    <ul className="ticket-list">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <TicketListItem
            ticket={ticket}
            isSelected={ticket.id === selectedTicketId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
