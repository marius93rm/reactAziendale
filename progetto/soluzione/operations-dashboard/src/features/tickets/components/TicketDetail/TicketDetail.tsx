/** TicketDetail rende il contratto ricevuto e non conosce la selezione. */
import { CalendarBlankIcon, UserIcon } from '@phosphor-icons/react';
import type { Ticket } from '../../ticket.types';
import './TicketDetail.scss';

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

type TicketDetailProps = {
  ticket: Ticket | null;
};

export function TicketDetail({ ticket }: TicketDetailProps) {
  if (!ticket) {
    return (
      <div className="ticket-detail ticket-detail--empty">
        <h2>Seleziona un ticket</h2>
        <p>Apri una riga della coda per consultarne i dati.</p>
      </div>
    );
  }

  return (
    <article className="ticket-detail">
      <header>
        <span>{ticket.id}</span>
        <h2>{ticket.title}</h2>
        <p>{ticket.customer}</p>
      </header>
      <p className="ticket-detail__description">{ticket.description}</p>
      <dl>
        <div>
          <dt>Assegnatario</dt>
          <dd>
            <UserIcon size={17} weight="bold" aria-hidden="true" />
            {ticket.assignee}
          </dd>
        </div>
        <div>
          <dt>Ultimo aggiornamento</dt>
          <dd>
            <CalendarBlankIcon size={17} weight="bold" aria-hidden="true" />
            <time dateTime={ticket.updatedAt}>
              {dateFormatter.format(new Date(ticket.updatedAt))}
            </time>
          </dd>
        </div>
        <div>
          <dt>Priorità</dt>
          <dd>{ticket.priority}</dd>
        </div>
      </dl>
    </article>
  );
}
