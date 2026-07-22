/**
 * Il container è il punto di composizione della feature.
 * Crea il servizio, esegue il custom hook e traduce il suo risultato nelle
 * props dichiarate dalla view. Nessun componente presentazionale importa il
 * servizio o conosce la provenienza dei dati.
 */
import { TicketDashboardView } from '../components/TicketDashboardView/TicketDashboardView';
import { useTicketDashboard } from '../hooks/useTicketDashboard';
import { createLocalTicketService } from '../services/createLocalTicketService';
import type { TicketService } from '../services/TicketService';

// Il parametro consente di provare il flusso error e retry dal browser.
const shouldFailOnce =
  new URLSearchParams(window.location.search).get('scenario') === 'error-once';

// La factory resta fuori dal render. L'identità stabile evita di riavviare
// l'Effect di useTickets a ogni aggiornamento dell'interfaccia.
const defaultTicketService = createLocalTicketService({
  failFirstRequest: shouldFailOnce,
});

type TicketDashboardContainerProps = {
  service?: TicketService;
};

export function TicketDashboardContainer({
  service = defaultTicketService,
}: TicketDashboardContainerProps = {}) {
  // Il container conosce il hook. La view riceve soltanto dati e callback.
  // Il servizio opzionale rende testabile l'intero retry senza modificare la UI.
  const dashboard = useTicketDashboard(service);

  return (
    <TicketDashboardView
      tickets={dashboard.tickets}
      selectedTicketId={dashboard.selectedTicketId}
      selectedTicket={dashboard.selectedTicket}
      query={dashboard.query}
      statusFilter={dashboard.statusFilter}
      summary={dashboard.summary}
      loadStatus={dashboard.loadStatus}
      error={dashboard.error}
      isSearching={dashboard.isSearching}
      onQueryChange={dashboard.setQuery}
      onStatusChange={dashboard.setStatusFilter}
      onSelectTicket={dashboard.selectTicket}
      onResetFilters={dashboard.resetFilters}
      onRetry={dashboard.retry}
    />
  );
}
