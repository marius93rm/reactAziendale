/**
 * Il hook di dominio possiede lo stato deciso dall'utente e compone i hook
 * tecnici. Restituisce dati e azioni nominate, mai elementi JSX.
 */
import { useState } from 'react';
import type { TicketStatusFilter } from '../ticket.types';
import type { TicketService } from '../services/TicketService';
import { useDebouncedValue } from './useDebouncedValue';
import { useTickets } from './useTickets';

export function useTicketDashboard(service: TicketService) {
  // Query, filtro e id sono stato reale: cambiano dopo un'azione dell'utente.
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('tutti');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  // L'input usa query senza ritardo. Il servizio riceve il valore stabilizzato.
  const debouncedQuery = useDebouncedValue(query, 350);
  const remote = useTickets(debouncedQuery, statusFilter, service);

  // Oggetto selezionato e riepilogo derivano dai ticket correnti. Conservarli
  // in un altro useState introdurrebbe copie da sincronizzare.
  const selectedTicket =
    remote.tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const summary = {
    total: remote.tickets.length,
    open: remote.tickets.filter((ticket) => ticket.status !== 'risolto').length,
    urgent: remote.tickets.filter(
      (ticket) => ticket.priority === 'critica' || ticket.priority === 'alta',
    ).length,
    waiting: remote.tickets.filter((ticket) => ticket.status === 'in-attesa').length,
  };

  function resetFilters() {
    setQuery('');
    setStatusFilter('tutti');
  }

  return {
    query,
    statusFilter,
    selectedTicketId,
    selectedTicket,
    tickets: remote.tickets,
    summary,
    loadStatus: remote.status,
    error: remote.error,
    isSearching: query !== debouncedQuery || remote.status === 'loading',
    retry: remote.retry,
    setQuery,
    setStatusFilter,
    selectTicket: setSelectedTicketId,
    resetFilters,
  };
}
