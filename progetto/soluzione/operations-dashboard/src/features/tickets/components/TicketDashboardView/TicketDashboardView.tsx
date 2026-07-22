/**
 * La view compone la UI usando soltanto dati, stati e callback ricevuti.
 * Non importa fixture, servizi o custom hook: può essere renderizzata con dati
 * costruiti a mano durante un test o una demo isolata.
 */
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import type {
  LoadStatus,
  Ticket,
  TicketStatusFilter,
} from '../../ticket.types';
import { StatePanel } from '../StatePanel/StatePanel';
import { TicketDashboardLayout } from '../TicketDashboardLayout/TicketDashboardLayout';
import { TicketDetail } from '../TicketDetail/TicketDetail';
import { TicketFilters } from '../TicketFilters/TicketFilters';
import { TicketList } from '../TicketList/TicketList';
import './TicketDashboardView.scss';

type TicketDashboardViewProps = {
  tickets: Ticket[];
  selectedTicketId: string | null;
  selectedTicket: Ticket | null;
  query: string;
  statusFilter: TicketStatusFilter;
  summary: { total: number; open: number; urgent: number; waiting: number };
  loadStatus: LoadStatus;
  error: string | null;
  isSearching: boolean;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TicketStatusFilter) => void;
  onSelectTicket: (ticketId: string) => void;
  onResetFilters: () => void;
  onRetry: () => void;
};

export function TicketDashboardView({
  tickets,
  selectedTicketId,
  selectedTicket,
  query,
  statusFilter,
  summary,
  loadStatus,
  error,
  isSearching,
  onQueryChange,
  onStatusChange,
  onSelectTicket,
  onResetFilters,
  onRetry,
}: TicketDashboardViewProps) {
  // Il nodo arriva già configurato al layout. Il layout decide la posizione,
  // mentre la view decide quale componente mostrare in quella posizione.
  const sidebar = (
    <TicketFilters
      query={query}
      status={statusFilter}
      resultCount={tickets.length}
      onQueryChange={onQueryChange}
      onStatusChange={onStatusChange}
      onReset={onResetFilters}
    />
  );

  return (
    <div className="ticket-dashboard-view">
      <a
        className="ticket-dashboard-view__skip-link"
        href="#main-content"
      >
        Vai al contenuto principale
      </a>

      <header className="ticket-dashboard-view__topbar">
        <div className="ticket-dashboard-view__brand">
          <BuildingsIcon size={20} weight="bold" aria-hidden="true" />
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </div>
        <span>Ambiente didattico</span>
      </header>

      <main id="main-content" className="ticket-dashboard-view__main">
        <header className="ticket-dashboard-view__heading">
          <div>
            <p>Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <span>
              Controlla le richieste aperte e assegna la priorità al prossimo
              intervento.
            </span>
          </div>
          <div aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard-view__metrics"
          aria-label="Riepilogo ticket"
        >
          <article>
            <TicketIcon size={20} aria-hidden="true" />
            <span>Totali</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <ClockIcon size={20} aria-hidden="true" />
            <span>Aperti</span>
            <strong>{summary.open}</strong>
          </article>
          <article>
            <WarningIcon size={20} aria-hidden="true" />
            <span>Alta priorità</span>
            <strong>{summary.urgent}</strong>
          </article>
          <article>
            <CheckCircleIcon size={20} aria-hidden="true" />
            <span>In attesa</span>
            <strong>{summary.waiting}</strong>
          </article>
        </section>

        <TicketDashboardLayout
          sidebar={sidebar}
          detail={<TicketDetail ticket={selectedTicket} />}
        >
          <section
            className="ticket-dashboard-view__queue"
            aria-labelledby="queue-title"
          >
            <header>
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span aria-live="polite">
                {isSearching ? 'Ricerca in corso' : `${tickets.length} risultati`}
              </span>
            </header>

            {/* Ogni stato asincrono produce una sola rappresentazione visibile. */}
            {loadStatus === 'loading' ? <StatePanel state="loading" /> : null}
            {loadStatus === 'error' ? (
              <StatePanel
                state="error"
                message={error ?? 'Errore imprevisto durante il caricamento.'}
                onRetry={onRetry}
              />
            ) : null}
            {loadStatus === 'success' && tickets.length === 0 ? (
              <StatePanel state="empty" onReset={onResetFilters} />
            ) : null}
            {loadStatus === 'success' && tickets.length > 0 ? (
              <TicketList
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelect={onSelectTicket}
              />
            ) : null}
          </section>
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
