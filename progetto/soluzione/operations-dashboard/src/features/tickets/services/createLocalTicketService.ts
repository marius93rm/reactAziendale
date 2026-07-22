/**
 * Il servizio locale simula latenza e filtro remoto senza richiedere un backend.
 * La factory crea istanze indipendenti, utili anche nei test.
 */
import { tickets } from '../tickets';
import type { TicketFiltersValue } from '../ticket.types';
import type { TicketService } from './TicketService';

type LocalTicketServiceOptions = {
  delay?: number;
  failFirstRequest?: boolean;
};

export function createLocalTicketService({
  delay = 450,
  failFirstRequest = false,
}: LocalTicketServiceOptions = {}): TicketService {
  // La variabile appartiene all'istanza del servizio. Ogni test può creare una
  // nuova factory senza condividere il risultato del primo errore.
  let hasFailed = false;

  return {
    list(filters: TicketFiltersValue, signal: AbortSignal) {
      return new Promise((resolve, reject) => {
        // Un signal già annullato non deve avviare timer o lavoro ulteriore.
        if (signal.aborted) {
          reject(new DOMException('Richiesta annullata', 'AbortError'));
          return;
        }

        const timerId = window.setTimeout(() => {
          // Il timer è terminato: il listener non serve più.
          signal.removeEventListener('abort', handleAbort);

          // Lo scenario didattico fallisce una volta e consente un retry reale.
          if (failFirstRequest && !hasFailed) {
            hasFailed = true;
            reject(new Error('Il servizio ticket non è disponibile.'));
            return;
          }

          // La normalizzazione rende il confronto indipendente da maiuscole e
          // spazi inseriti all'inizio o alla fine della ricerca.
          const normalizedQuery = filters.query
            .trim()
            .toLocaleLowerCase('it-IT');
          const result = tickets.filter((ticket) => {
            const matchesStatus =
              filters.status === 'tutti' || ticket.status === filters.status;
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

          resolve(result);
        }, delay);

        function handleAbort() {
          // La cancellazione ferma il timer e chiude la Promise con AbortError.
          window.clearTimeout(timerId);
          reject(new DOMException('Richiesta annullata', 'AbortError'));
        }

        signal.addEventListener('abort', handleAbort, { once: true });
      });
    },
  };
}
