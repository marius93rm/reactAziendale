/**
 * OperationsDashboard contiene intenzionalmente più responsabilità:
 * stato, dati derivati, filtri, lista e riepilogo vivono nello stesso file.
 * Lo starter funziona, mentre i TODO mostreranno come separare questi confini.
 */
import { useState } from 'react';
import {
  ArrowClockwiseIcon,
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { tickets } from './tickets';
import type {
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
import './OperationsDashboard.scss';

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

export function OperationsDashboard() {
  // Questi valori rappresentano stato reale perché cambiano dopo un'azione utente.
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('tutti');
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0].id);

  // I conteggi derivano dalle fixture. Un secondo useState creerebbe una copia da sincronizzare.
  const openTicketsCount = tickets.filter(
    (ticket) => ticket.status !== 'risolto',
  ).length;
  const urgentTicketsCount = tickets.filter(
    (ticket) => ticket.priority === 'critica' || ticket.priority === 'alta',
  ).length;
  const waitingTicketsCount = tickets.filter(
    (ticket) => ticket.status === 'in-attesa',
  ).length;

  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');

  // La lista visibile è derived state: gli input sono ticket, query e filtro.
  const visibleTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === 'tutti' || ticket.status === statusFilter;
    const searchableText = [
      ticket.id,
      ticket.title,
      ticket.customer,
      ticket.assignee,
      ticket.description,
    ]
      .join(' ')
      .toLocaleLowerCase('it-IT');

    return matchesStatus && searchableText.includes(normalizedQuery);
  });

  const hasActiveFilters = query !== '' || statusFilter !== 'tutti';
  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  function resetFilters() {
    setQuery('');
    setStatusFilter('tutti');
  }

  return (
    <div className="operations-dashboard">
      <header className="operations-dashboard__topbar">
        <a className="operations-dashboard__brand" href="#main-content">
          <span className="operations-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="operations-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="operations-dashboard__main">
        <header className="operations-dashboard__heading">
          <div>
            <p className="operations-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="operations-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="operations-dashboard__metrics"
          aria-label="Riepilogo ticket"
        >
          <article>
            <TicketIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Totali</span>
            <strong>{tickets.length}</strong>
          </article>
          <article>
            <ClockIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Aperti</span>
            <strong>{openTicketsCount}</strong>
          </article>
          <article>
            <WarningIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Alta priorità</span>
            <strong>{urgentTicketsCount}</strong>
          </article>
          <article>
            <CheckCircleIcon size={20} weight="duotone" aria-hidden="true" />
            <span>In attesa</span>
            <strong>{waitingTicketsCount}</strong>
          </article>
        </section>

        <div className="operations-dashboard__workspace">
          <aside
            className="operations-dashboard__filters"
            aria-labelledby="filters-title"
          >
            <div className="operations-dashboard__section-title">
              <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
              <h2 id="filters-title">Filtri</h2>
            </div>

            <label className="operations-dashboard__field">
              <span>Cerca nella coda</span>
              <span className="operations-dashboard__input-wrap">
                <MagnifyingGlassIcon
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ID, cliente o titolo"
                />
              </span>
            </label>

            <label className="operations-dashboard__field">
              <span>Stato</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as TicketStatusFilter)
                }
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="nuovo">Nuovo</option>
                <option value="in-lavorazione">In lavorazione</option>
                <option value="in-attesa">In attesa</option>
                <option value="risolto">Risolto</option>
              </select>
            </label>

            <button
              className="operations-dashboard__reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              Reimposta filtri
            </button>

            <div className="operations-dashboard__filter-note">
              <strong>{visibleTickets.length}</strong>
              <span>ticket nella vista corrente</span>
            </div>
          </aside>

          <section
            className="operations-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="operations-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <ul className="operations-dashboard__ticket-list">
                {visibleTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;

                  return (
                    <li key={ticket.id}>
                      <button
                        className="operations-dashboard__ticket"
                        data-selected={isSelected}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <span className="operations-dashboard__ticket-main">
                          <span className="operations-dashboard__ticket-meta">
                            <strong>{ticket.id}</strong>
                            <span
                              className="operations-dashboard__status"
                              data-status={ticket.status}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </span>
                          <strong className="operations-dashboard__ticket-title">
                            {ticket.title}
                          </strong>
                          <span className="operations-dashboard__ticket-customer">
                            {ticket.customer}
                          </span>
                        </span>

                        <span className="operations-dashboard__ticket-side">
                          <span
                            className="operations-dashboard__priority"
                            data-priority={ticket.priority}
                          >
                            {priorityLabels[ticket.priority]}
                          </span>
                          <span>{ticket.assignee}</span>
                          <time dateTime={ticket.updatedAt}>
                            {dateFormatter.format(new Date(ticket.updatedAt))}
                          </time>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="operations-dashboard__empty" role="status">
                <MagnifyingGlassIcon
                  size={28}
                  weight="duotone"
                  aria-hidden="true"
                />
                <h3>Nessun ticket trovato</h3>
                <p>Modifica la ricerca oppure reimposta i filtri.</p>
                <button type="button" onClick={resetFilters}>
                  Mostra tutti i ticket
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

