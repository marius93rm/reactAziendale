/**
 * TicketFilters rende controlli controllati e delega le azioni al chiamante.
 * Query e stato arrivano tramite props, quindi il componente non crea copie
 * locali che potrebbero divergere dal proprietario dello stato.
 */
import {
  ArrowClockwiseIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import { Button } from '../../../../shared/components/Button/Button';
import type { TicketStatusFilter } from '../../ticket.types';
import './TicketFilters.scss';

type TicketFiltersProps = {
  query: string;
  status: TicketStatusFilter;
  resultCount: number;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TicketStatusFilter) => void;
  onReset: () => void;
};

export function TicketFilters({
  query,
  status,
  resultCount,
  onQueryChange,
  onStatusChange,
  onReset,
}: TicketFiltersProps) {
  // Il button usa un valore derivato dalle props correnti.
  const hasActiveFilters = query !== '' || status !== 'tutti';

  return (
    <div className="ticket-filters">
      <div className="ticket-filters__title">
        <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
        <h2>Filtri</h2>
      </div>
      <label className="ticket-filters__field">
        <span>Cerca nella coda</span>
        <span className="ticket-filters__search">
          <MagnifyingGlassIcon size={18} weight="bold" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="ID, cliente o titolo"
          />
        </span>
      </label>
      <label className="ticket-filters__field">
        <span>Stato</span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as TicketStatusFilter)
          }
        >
          <option value="tutti">Tutti gli stati</option>
          <option value="nuovo">Nuovo</option>
          <option value="in-lavorazione">In lavorazione</option>
          <option value="in-attesa">In attesa</option>
          <option value="risolto">Risolto</option>
        </select>
      </label>
      <Button
        variant="secondary"
        icon={
          <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
        }
        onClick={onReset}
        disabled={!hasActiveFilters}
      >
        Reimposta filtri
      </Button>
      <p className="ticket-filters__result">
        <strong>{resultCount}</strong> ticket nella vista corrente
      </p>
    </div>
  );
}
