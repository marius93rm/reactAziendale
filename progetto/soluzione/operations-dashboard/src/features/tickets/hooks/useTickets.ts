/**
 * useTickets sincronizza filtri React e servizio dati.
 * Il hook gestisce il ciclo loading, success, error e l'annullamento delle
 * richieste che non servono più.
 */
import { useEffect, useState } from 'react';
import type { LoadStatus, Ticket, TicketStatusFilter } from '../ticket.types';
import type { TicketService } from '../services/TicketService';

export function useTickets(
  query: string,
  statusFilter: TicketStatusFilter,
  service: TicketService,
) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ogni esecuzione possiede il proprio controller. La cleanup annulla solo
    // la richiesta associata a questa combinazione di filtri.
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    service
      .list({ query, status: statusFilter }, controller.signal)
      .then((result) => {
        // Il servizio restituisce già la lista filtrata pronta per la view.
        setTickets(result);
        setStatus('success');
      })
      .catch((requestError: unknown) => {
        // Un abort rappresenta una richiesta superata, non un errore da mostrare.
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Errore imprevisto durante il caricamento.',
        );
        setStatus('error');
      });

    return () => controller.abort();
    // Query, filtro e retry cambiano la richiesta. Service deve essere stabile.
  }, [query, reloadKey, service, statusFilter]);

  function retry() {
    // Il contatore cambia una dipendenza dell'Effect senza ricaricare la pagina.
    setReloadKey((currentKey) => currentKey + 1);
  }

  return { tickets, status, error, retry };
}
