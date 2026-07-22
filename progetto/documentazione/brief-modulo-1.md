# Laboratorio Modulo 1: rifattorizzare una Operations Dashboard

## Obiettivo

Parti da una dashboard funzionante e trasformala in una feature React con confini leggibili. Alla fine del laboratorio avrai componenti presentazionali, un container, custom hook, un servizio iniettato e una struttura feature-based.

Il comportamento iniziale deve restare disponibile durante il refactoring. I test dello starter proteggono ricerca, filtro, reset e selezione.

## Prerequisiti

- Node.js 22.13 o successivo. Il progetto include `.nvmrc` per Node 24.12.
- npm 10 o successivo.
- Conoscenza di componenti funzionali, `useState`, `useEffect`, props e moduli ES.

## Avvio

Esegui i comandi dalla radice della repository:

```bash
cd progetto/starter/operations-dashboard
nvm use
npm ci
npm run dev
```

Apri l'indirizzo stampato da Vite. Prova queste azioni prima di modificare il codice:

1. Cerca `Fonderie Lario`.
2. Filtra lo stato `In attesa`.
3. Seleziona un ticket diverso.
4. Inserisci un testo senza risultati e usa `Mostra tutti i ticket`.

Chiudi il controllo iniziale con:

```bash
npm run check
```

## Struttura iniziale

```text
src/
├── App.tsx
├── main.tsx
├── vite-env.d.ts
├── dashboard/
│   ├── OperationsDashboard.scss
│   ├── OperationsDashboard.test.tsx
│   ├── OperationsDashboard.tsx
│   ├── ticket.types.ts
│   └── tickets.ts
├── styles/
│   ├── _tokens.scss
│   └── global.scss
└── test/
    └── setup.ts
```

`OperationsDashboard.tsx` contiene stato, filtri, calcoli e rendering. Il componente funziona, ma una modifica alla coda richiede di leggere un file ampio e coordinare responsabilità diverse.

## Metodo di lavoro

Per ogni TODO:

1. leggi obiettivo e motivazione;
2. prova a eseguire i passaggi senza aprire il codice completo;
3. confronta il tuo risultato con la sezione richiudibile;
4. prova il comportamento indicato;
5. esegui `npm run check`.

Non proseguire con test rossi o errori TypeScript. Il TODO successivo parte dal checkpoint precedente.

---

## TODO 01: definisci la feature e il naming

### Obiettivo

Raccogli il codice dei ticket dentro `features/tickets` e assegna nomi che descrivono il dominio.

### Concetto del Modulo 1

La feature-based structure tiene vicini i file che cambiano per la stessa richiesta di prodotto. PascalCase identifica i componenti, camelCase le funzioni e il prefisso `use` gli hook.

### Punto di partenza

La cartella `dashboard` descrive una schermata generica. Il contenuto riguarda invece la gestione dei ticket. `App` importa anche un file interno, quindi conosce la struttura della feature.

### File da modificare

- Sposta `src/dashboard` in `src/features/tickets`.
- Rinomina `OperationsDashboard.tsx`, `.scss` e `.test.tsx` con il nome base `TicketDashboard`.
- Crea `src/features/tickets/index.ts`.
- Aggiorna `src/App.tsx`.

### Passaggi guidati

1. Crea `src/features` e sposta la cartella esistente.
2. Rinomina i tre file `OperationsDashboard` in `TicketDashboard`.
3. Dentro TSX, SCSS e test sostituisci `OperationsDashboard` con `TicketDashboard` e `operations-dashboard` con `ticket-dashboard`.
4. Esporta soltanto il componente necessario ad `App`.
5. Aggiorna l'import in `App.tsx`.

Puoi eseguire gli spostamenti dal terminale:

```bash
mkdir -p src/features
mv src/dashboard src/features/tickets
mv src/features/tickets/OperationsDashboard.tsx src/features/tickets/TicketDashboard.tsx
mv src/features/tickets/OperationsDashboard.scss src/features/tickets/TicketDashboard.scss
mv src/features/tickets/OperationsDashboard.test.tsx src/features/tickets/TicketDashboard.test.tsx
```

Apri i file rinominati e aggiorna simboli, import dello stile e classi CSS. Evita una sostituzione globale fuori dalla cartella della feature.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri il codice completo di index.ts e App.tsx</summary>

`src/features/tickets/index.ts`

```ts
/**
 * Questa è l'API pubblica della feature.
 * I chiamanti non devono conoscere cartelle e file interni.
 */
export { TicketDashboard } from './TicketDashboard';
export type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
```

`src/App.tsx`

```tsx
/**
 * App usa la feature attraverso l'API pubblica.
 * Un refactoring interno a tickets non richiederà nuovi percorsi qui.
 */
import { TicketDashboard } from './features/tickets';

export function App() {
  return <TicketDashboard />;
}
```

</details>

<details>
<summary>Apri i tre file rinominati completi</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
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
import './TicketDashboard.scss';

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

export function TicketDashboard() {
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
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
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

        <div className="ticket-dashboard__workspace">
          <aside
            className="ticket-dashboard__filters"
            aria-labelledby="filters-title"
          >
            <div className="ticket-dashboard__section-title">
              <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
              <h2 id="filters-title">Filtri</h2>
            </div>

            <label className="ticket-dashboard__field">
              <span>Cerca nella coda</span>
              <span className="ticket-dashboard__input-wrap">
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

            <label className="ticket-dashboard__field">
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
              className="ticket-dashboard__reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              Reimposta filtri
            </button>

            <div className="ticket-dashboard__filter-note">
              <strong>{visibleTickets.length}</strong>
              <span>ticket nella vista corrente</span>
            </div>
          </aside>

          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <ul className="ticket-dashboard__ticket-list">
                {visibleTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;

                  return (
                    <li key={ticket.id}>
                      <button
                        className="ticket-dashboard__ticket"
                        data-selected={isSelected}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <span className="ticket-dashboard__ticket-main">
                          <span className="ticket-dashboard__ticket-meta">
                            <strong>{ticket.id}</strong>
                            <span
                              className="ticket-dashboard__status"
                              data-status={ticket.status}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </span>
                          <strong className="ticket-dashboard__ticket-title">
                            {ticket.title}
                          </strong>
                          <span className="ticket-dashboard__ticket-customer">
                            {ticket.customer}
                          </span>
                        </span>

                        <span className="ticket-dashboard__ticket-side">
                          <span
                            className="ticket-dashboard__priority"
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
              <div className="ticket-dashboard__empty" role="status">
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
```

`src/features/tickets/TicketDashboard.scss`

```scss
/**
 * Il foglio usa un namespace unico per tenere gli stili vicini al componente.
 * I breakpoint mostrano in modo esplicito il passaggio a una colonna.
 */
@use '../styles/tokens' as t;

.ticket-dashboard {
  min-height: 100dvh;
  background: t.$color-slate-50;

  &__topbar {
    display: flex;
    min-height: 4.5rem;
    align-items: center;
    justify-content: space-between;
    padding: t.$space-3 clamp(t.$space-4, 4vw, t.$space-10);
    background: t.$color-navy-900;
    color: t.$color-white;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: t.$space-3;
    color: inherit;
    text-decoration: none;

    strong,
    small {
      display: block;
    }

    strong {
      letter-spacing: -0.01em;
    }

    small {
      margin-top: 0.125rem;
      color: t.$color-slate-300;
      font-size: 0.75rem;
    }
  }

  &__brand-mark {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 0.2);
    border-radius: t.$radius-control;
    background: rgb(255 255 255 / 0.08);
  }

  &__environment {
    border: 1px solid rgb(255 255 255 / 0.22);
    border-radius: t.$radius-control;
    padding: t.$space-2 t.$space-3;
    color: t.$color-slate-200;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__main {
    width: min(100% - 2rem, 90rem);
    margin-inline: auto;
    padding-block: clamp(t.$space-6, 4vw, t.$space-10);
  }

  &__heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: t.$space-6;
    margin-bottom: t.$space-8;

    h1 {
      margin: t.$space-1 0 t.$space-2;
      color: t.$color-navy-950;
      font-size: clamp(2rem, 4vw, 3.25rem);
      line-height: 1.04;
      letter-spacing: -0.04em;
    }

    p:not(.ticket-dashboard__context) {
      max-width: 42rem;
      margin: 0;
      color: t.$color-slate-600;
    }
  }

  &__context {
    margin: 0;
    color: t.$color-blue-700;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__selection {
    flex: 0 0 auto;
    border-left: 0.1875rem solid t.$color-blue-600;
    padding: t.$space-2 0 t.$space-2 t.$space-4;

    span,
    strong {
      display: block;
    }

    span {
      color: t.$color-slate-600;
      font-size: 0.75rem;
    }

    strong {
      color: t.$color-navy-900;
      font-size: 1.125rem;
    }
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: t.$space-6;
    overflow: hidden;
    border: 1px solid t.$color-slate-200;
    border-radius: t.$radius-panel;
    background: t.$color-white;
    box-shadow: t.$shadow-panel;

    article {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      column-gap: t.$space-3;
      padding: t.$space-5 t.$space-6;
    }

    article + article {
      border-left: 1px solid t.$color-slate-200;
    }

    svg {
      grid-row: 1 / 3;
      color: t.$color-blue-700;
    }

    span {
      color: t.$color-slate-600;
      font-size: 0.75rem;
      font-weight: 700;
    }

    strong {
      color: t.$color-navy-950;
      font-size: 1.5rem;
      line-height: 1.1;
    }
  }

  &__workspace {
    display: grid;
    grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
    gap: t.$space-6;
    align-items: start;
  }

  &__filters,
  &__queue {
    border: 1px solid t.$color-slate-200;
    border-radius: t.$radius-panel;
    background: t.$color-white;
    box-shadow: t.$shadow-panel;
  }

  &__filters {
    padding: t.$space-5;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: t.$space-2;
    margin-bottom: t.$space-5;
    color: t.$color-navy-900;

    h2 {
      margin: 0;
      font-size: 1rem;
    }
  }

  &__field {
    display: grid;
    gap: t.$space-2;
    margin-bottom: t.$space-5;
    color: t.$color-slate-700;
    font-size: 0.8125rem;
    font-weight: 700;

    input,
    select {
      width: 100%;
      min-height: 2.75rem;
      border: 1px solid t.$color-slate-300;
      border-radius: t.$radius-control;
      background: t.$color-white;
      color: t.$color-slate-950;
    }

    input {
      border: 0;
      outline: 0;
    }

    input::placeholder {
      color: t.$color-slate-500;
    }

    select {
      padding: 0 t.$space-3;
    }
  }

  &__input-wrap {
    display: flex;
    min-height: 2.75rem;
    align-items: center;
    gap: t.$space-2;
    border: 1px solid t.$color-slate-300;
    border-radius: t.$radius-control;
    padding-inline: t.$space-3;
    background: t.$color-white;

    &:focus-within {
      outline: 0.1875rem solid t.$color-blue-600;
      outline-offset: 0.1875rem;
    }

    svg {
      flex: 0 0 auto;
      color: t.$color-slate-500;
    }
  }

  &__reset {
    display: inline-flex;
    width: 100%;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    gap: t.$space-2;
    border: 1px solid t.$color-blue-600;
    border-radius: t.$radius-control;
    background: t.$color-white;
    color: t.$color-blue-700;
    font-weight: 800;

    &:active:not(:disabled) {
      transform: translateY(1px);
    }

    &:disabled {
      border-color: t.$color-slate-200;
      color: t.$color-slate-500;
      cursor: not-allowed;
    }
  }

  &__filter-note {
    display: flex;
    align-items: baseline;
    gap: t.$space-2;
    margin-top: t.$space-6;
    border-top: 1px solid t.$color-slate-200;
    padding-top: t.$space-4;

    strong {
      color: t.$color-navy-900;
      font-size: 1.5rem;
    }

    span {
      color: t.$color-slate-600;
      font-size: 0.75rem;
    }
  }

  &__queue {
    min-width: 0;
    overflow: hidden;
  }

  &__queue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: t.$space-4;
    padding: t.$space-5 t.$space-6;
    background: t.$color-slate-50;

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: t.$color-navy-950;
      font-size: 1rem;
    }

    p,
    > span {
      color: t.$color-slate-600;
      font-size: 0.75rem;
    }

    > span {
      flex: 0 0 auto;
      font-weight: 700;
    }
  }

  &__ticket-list {
    margin: 0;
    padding: 0;
    list-style: none;

    li + li {
      border-top: 1px solid t.$color-slate-200;
    }
  }

  &__ticket {
    display: grid;
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: t.$space-6;
    border: 0;
    border-left: 0.25rem solid transparent;
    padding: t.$space-5 t.$space-6;
    background: t.$color-white;
    color: inherit;
    text-align: left;

    &:hover {
      background: t.$color-slate-50;
    }

    &[data-selected='true'] {
      border-left-color: t.$color-blue-600;
      background: #eff6ff;
    }
  }

  &__ticket-main,
  &__ticket-side {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  &__ticket-main {
    gap: t.$space-1;
  }

  &__ticket-side {
    align-items: flex-end;
    justify-content: space-between;
    gap: t.$space-1;
    color: t.$color-slate-600;
    font-size: 0.75rem;
  }

  &__ticket-meta {
    display: flex;
    align-items: center;
    gap: t.$space-2;

    > strong {
      color: t.$color-blue-700;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
    }
  }

  &__ticket-title {
    overflow: hidden;
    color: t.$color-navy-950;
    font-size: 0.9375rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__ticket-customer {
    color: t.$color-slate-600;
    font-size: 0.8125rem;
  }

  &__status,
  &__priority {
    display: inline-flex;
    width: max-content;
    border-radius: t.$radius-control;
    font-size: 0.6875rem;
    font-weight: 800;
  }

  &__status {
    padding: 0.125rem t.$space-2;
    background: t.$color-slate-100;
    color: t.$color-slate-700;

    &[data-status='in-lavorazione'] {
      background: #eef4ff;
      color: t.$color-blue-700;
    }

    &[data-status='in-attesa'] {
      background: t.$color-warning-soft;
      color: t.$color-warning;
    }

    &[data-status='risolto'] {
      background: t.$color-success-soft;
      color: t.$color-success;
    }
  }

  &__priority {
    padding: 0.1875rem t.$space-2;
    background: t.$color-slate-100;
    color: t.$color-slate-700;

    &[data-priority='critica'],
    &[data-priority='alta'] {
      background: t.$color-danger-soft;
      color: t.$color-danger;
    }
  }

  &__empty {
    display: grid;
    min-height: 22rem;
    place-items: center;
    align-content: center;
    gap: t.$space-2;
    padding: t.$space-8;
    text-align: center;

    svg {
      color: t.$color-blue-700;
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: t.$color-navy-950;
    }

    p {
      color: t.$color-slate-600;
    }

    button {
      min-height: 2.75rem;
      margin-top: t.$space-3;
      border: 0;
      border-radius: t.$radius-control;
      padding-inline: t.$space-4;
      background: t.$color-blue-600;
      color: t.$color-white;
      font-weight: 800;

      &:hover {
        background: t.$color-blue-700;
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }
}

@media (max-width: 64rem) {
  .ticket-dashboard {
    &__metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      article:nth-child(3) {
        border-left: 0;
      }

      article:nth-child(n + 3) {
        border-top: 1px solid t.$color-slate-200;
      }
    }

    &__ticket {
      gap: t.$space-4;
    }
  }
}

@media (max-width: 48rem) {
  .ticket-dashboard {
    &__topbar,
    &__heading,
    &__queue-header {
      align-items: flex-start;
    }

    &__heading,
    &__workspace {
      display: grid;
      grid-template-columns: 1fr;
    }

    &__selection {
      width: 100%;
    }

    &__workspace {
      gap: t.$space-4;
    }

    &__filters {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: t.$space-4;

      .ticket-dashboard__section-title,
      .ticket-dashboard__filter-note {
        grid-column: 1 / -1;
        margin: 0;
      }

      .ticket-dashboard__field {
        margin: 0;
      }
    }
  }
}

@media (max-width: 36rem) {
  .ticket-dashboard {
    &__environment {
      display: none;
    }

    &__main {
      width: min(100% - 1.25rem, 90rem);
    }

    &__metrics,
    &__filters {
      grid-template-columns: 1fr;
    }

    &__metrics {
      article + article {
        border-top: 1px solid t.$color-slate-200;
        border-left: 0;
      }
    }

    &__filters {
      .ticket-dashboard__field,
      .ticket-dashboard__reset {
        grid-column: 1;
      }
    }

    &__queue-header,
    &__ticket {
      padding-inline: t.$space-4;
    }

    &__ticket {
      grid-template-columns: 1fr;
    }

    &__ticket-side {
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-content: start;
      gap: t.$space-2 t.$space-4;
      align-items: center;

      time {
        grid-column: 1 / -1;
      }
    }
  }
}
```

`src/features/tickets/TicketDashboard.test.tsx`

```tsx
/**
 * I test descrivono il comportamento che deve restare stabile durante il refactoring.
 * Gli studenti non devono conoscere la struttura interna del componente.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDashboard } from './TicketDashboard';

describe('TicketDashboard', () => {
  it('mostra il riepilogo e la coda iniziale', () => {
    render(<TicketDashboard />);

    expect(
      screen.getByRole('heading', { name: 'Operations Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1847.*Ordini bloccati nel controllo disponibilità/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('filtra i ticket usando la ricerca controllata', async () => {
    const user = userEvent.setup();
    render(<TicketDashboard />);

    await user.type(screen.getByRole('searchbox'), 'Fonderie Lario');

    expect(screen.getByText('1 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1796.*Data consegna spostata di un giorno/i,
      }),
    ).toBeInTheDocument();
  });

  it('combina filtro per stato e reset', async () => {
    const user = userEvent.setup();
    render(<TicketDashboard />);

    await user.selectOptions(screen.getByLabelText('Stato'), 'in-attesa');
    expect(screen.getByText('3 risultati')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reimposta filtri' }));
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });

  it('aggiorna la selezione senza dipendere dalla posizione in lista', async () => {
    const user = userEvent.setup();
    render(<TicketDashboard />);
    const ticketButton = screen.getByRole('button', {
      name: /OPS-1839.*Doppia notifica per le richieste approvate/i,
    });

    await user.click(ticketButton);

    expect(ticketButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('mostra un empty state e permette di tornare alla coda', async () => {
    const user = userEvent.setup();
    render(<TicketDashboard />);

    await user.type(screen.getByRole('searchbox'), 'testo senza risultati');
    expect(screen.getByRole('status')).toHaveTextContent('Nessun ticket trovato');

    await user.click(
      screen.getByRole('button', { name: 'Mostra tutti i ticket' }),
    );
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });
});
```

</details>


### Spiegazione del codice

`index.ts` espone un contratto piccolo. I file interni continueranno a usare import diretti, mentre `App` vede soltanto ciò che la feature decide di pubblicare. Questo confine permette di spostare componenti interni senza propagare la modifica.

### Perché facciamo questo passaggio

La struttura comunica il linguaggio del prodotto. Una richiesta sui ticket porta il team in `features/tickets`, senza attraversare cartelle globali divise per tipo tecnico.

### Verifica

1. Avvia l'app e controlla che la dashboard conservi lo stesso aspetto.
2. Cerca un cliente e seleziona un ticket.
3. Cerca import esterni alla feature che usano percorsi profondi:

```bash
rg "features/tickets/" src --glob '*.ts' --glob '*.tsx'
```

Il solo import esterno deve puntare a `./features/tickets`.

### Errori comuni

- Lasciare l'import di `./OperationsDashboard.scss` nel file rinominato.
- Rinominare il file senza rinominare la funzione esportata.
- Esportare fixture e implementazioni interne da `index.ts` senza un consumatore reale.

### Checkpoint

- [ ] La dashboard funziona come prima.
- [ ] I tre artefatti del componente condividono il nome base.
- [ ] `App` usa l'API pubblica.
- [ ] `npm run check` termina senza errori.

---

## TODO 02: estrai il layout con composition

### Obiettivo

Estrai un guscio che posizioni filtri, contenuto e dettaglio senza importare componenti concreti.

### Concetto del Modulo 1

Component composition sposta la scelta dei contenuti nel chiamante. `children` descrive il flusso principale, mentre gli slot nominati descrivono posizioni con un significato stabile.

### Punto di partenza

`TicketDashboard` contiene direttamente il `div` della workspace, l'`aside` dei filtri e la sezione della coda. Il componente decide sia la struttura sia il contenuto.

### File da modificare

- Crea `src/features/tickets/components/TicketDashboardLayout/TicketDashboardLayout.tsx`.
- Crea il file Sass con lo stesso nome base.
- Sostituisci il markup della workspace dentro `TicketDashboard.tsx`.

### Passaggi guidati

1. Definisci `sidebar`, `detail` e `children` come `ReactNode`.
2. Rendi `detail` opzionale, perché lo aggiungerai nel TODO 04.
3. Mantieni `main` sul componente pagina. Il layout usa `div`, `aside` e sezioni interne.
4. Passa il markup dei filtri nello slot `sidebar`.
5. Passa la coda come `children`.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri i file completi del layout</summary>

`src/features/tickets/components/TicketDashboardLayout/TicketDashboardLayout.tsx`

```tsx
/**
 * Il layout conosce le posizioni della dashboard.
 * I nodi arrivano dal chiamante, quindi il layout non importa la feature.
 */
import type { ReactNode } from 'react';
import './TicketDashboardLayout.scss';

type TicketDashboardLayoutProps = {
  sidebar: ReactNode;
  detail?: ReactNode;
  children: ReactNode;
};

export function TicketDashboardLayout({
  sidebar,
  detail,
  children,
}: TicketDashboardLayoutProps) {
  return (
    <div className="ticket-dashboard-layout">
      <aside
        className="ticket-dashboard-layout__sidebar"
        aria-label="Filtri ticket"
      >
        {sidebar}
      </aside>
      <section className="ticket-dashboard-layout__content">{children}</section>
      {detail ? (
        <aside
          className="ticket-dashboard-layout__detail"
          aria-label="Dettaglio ticket"
        >
          {detail}
        </aside>
      ) : null}
    </div>
  );
}
```

`src/features/tickets/components/TicketDashboardLayout/TicketDashboardLayout.scss`

```scss
/** Il layout controlla soltanto colonne, spazi e contenitori. */
@use '../../../../styles/tokens' as t;

.ticket-dashboard-layout {
  display: grid;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
  gap: t.$space-6;
  align-items: start;

  &__sidebar,
  &__content,
  &__detail {
    min-width: 0;
  }
}

@media (min-width: 78rem) {
  .ticket-dashboard-layout:has(.ticket-dashboard-layout__detail) {
    grid-template-columns: minmax(14rem, 17rem) minmax(0, 1fr) minmax(18rem, 22rem);
  }
}

@media (min-width: 48.0625rem) and (max-width: 77.999rem) {
  .ticket-dashboard-layout__detail {
    grid-column: 1 / -1;
  }
}

@media (max-width: 48rem) {
  .ticket-dashboard-layout {
    grid-template-columns: 1fr;
    gap: t.$space-4;
  }
}
```

</details>

Nel file `TicketDashboard.tsx` importa il layout e sostituisci il wrapper della workspace con questa composizione:

```tsx
<TicketDashboardLayout sidebar={sidebar}>
  {queue}
</TicketDashboardLayout>
```

In questa fase `sidebar` e `queue` sono variabili JSX locali. Il TODO 05
trasformerà i filtri in un componente controllato.

### Spiegazione del codice

<details>
<summary>Apri TicketDashboard.tsx completo dopo il TODO 02</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
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
import { TicketDashboardLayout } from './components/TicketDashboardLayout/TicketDashboardLayout';
import { tickets } from './tickets';
import type {
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
import './TicketDashboard.scss';

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

export function TicketDashboard() {
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

  const sidebar = (
          <div
            className="ticket-dashboard__filters"
            aria-labelledby="filters-title"
          >
            <div className="ticket-dashboard__section-title">
              <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
              <h2 id="filters-title">Filtri</h2>
            </div>

            <label className="ticket-dashboard__field">
              <span>Cerca nella coda</span>
              <span className="ticket-dashboard__input-wrap">
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

            <label className="ticket-dashboard__field">
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
              className="ticket-dashboard__reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              Reimposta filtri
            </button>

            <div className="ticket-dashboard__filter-note">
              <strong>{visibleTickets.length}</strong>
              <span>ticket nella vista corrente</span>
            </div>
          </div>
  );

  const queue = (
          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <ul className="ticket-dashboard__ticket-list">
                {visibleTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;

                  return (
                    <li key={ticket.id}>
                      <button
                        className="ticket-dashboard__ticket"
                        data-selected={isSelected}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <span className="ticket-dashboard__ticket-main">
                          <span className="ticket-dashboard__ticket-meta">
                            <strong>{ticket.id}</strong>
                            <span
                              className="ticket-dashboard__status"
                              data-status={ticket.status}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </span>
                          <strong className="ticket-dashboard__ticket-title">
                            {ticket.title}
                          </strong>
                          <span className="ticket-dashboard__ticket-customer">
                            {ticket.customer}
                          </span>
                        </span>

                        <span className="ticket-dashboard__ticket-side">
                          <span
                            className="ticket-dashboard__priority"
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
              <div className="ticket-dashboard__empty" role="status">
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
  );

  return (
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
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

        <TicketDashboardLayout sidebar={sidebar}>
          {queue}
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

</details>


Il layout riceve nodi già costruiti. Non riceve `query`, `statusFilter` o callback, perché non usa quei dati. Lo slot `detail` resta assente dal DOM finché il chiamante non passa un pannello.

### Perché facciamo questo passaggio

Il layout cambia quando cambia la disposizione. I ticket cambiano quando cambia il dominio. Separare le due ragioni riduce l'impatto di una modifica responsive o di una nuova vista.

### Verifica

- Controlla la dashboard sopra e sotto 768 pixel.
- Cerca import di `TicketList` o `TicketFilters` dentro il layout. Non devono esistere.
- Esegui `npm run check`.

### Errori comuni

- Passare `showDetail` insieme a `detail`. La presenza del nodo contiene già l'informazione.
- Inserire `main` nel layout quando la pagina ne possiede già uno.
- Spostare nello stile del layout colori e tipografia dei ticket.

### Checkpoint

- [ ] Il layout usa composition.
- [ ] Gli slot hanno nomi legati alla posizione.
- [ ] Il layout non dipende da componenti della feature.
- [ ] Mobile e desktop restano leggibili.

---

## TODO 03: separa la lista presentazionale

### Obiettivo

Estrai la coda in componenti che ricevono ticket, selezione e callback tramite props.

### Concetto del Modulo 1

Un componente presentazionale rende un contratto. Non conosce fixture, servizi, router o regole per ottenere i dati.

### Punto di partenza

`TicketDashboard` esegue il `map`, costruisce ogni riga e decide come selezionare un ticket. La key e l'evento appartengono alla lista.

### File da modificare

- Crea `components/TicketList/TicketList.tsx`.
- Crea `components/TicketList/TicketListItem.tsx`.
- Crea `components/TicketList/TicketList.scss`.
- Sostituisci il markup della lista in `TicketDashboard.tsx`.

### Passaggi guidati

1. Passa a `TicketList` l'array, l'id selezionato e `onSelect`.
2. Usa `ticket.id` come key. La key segue l'entità durante filtri e riordini.
3. Passa il singolo ticket a `TicketListItem`.
4. Rendi ogni riga un button con `aria-pressed`.
5. Mantieni l'empty state nel chiamante. Il TODO 08 lo renderà riusabile.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri i file completi della lista</summary>

`src/features/tickets/components/TicketList/TicketList.tsx`

```tsx
/** TicketList gestisce l'identità della collezione e delega la singola riga. */
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
```

`src/features/tickets/components/TicketList/TicketListItem.tsx`

```tsx
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
```

`src/features/tickets/components/TicketList/TicketList.scss`

```scss
/** La lista possiede righe, stati di selezione e badge del dominio ticket. */
@use '../../../../styles/tokens' as t;

.ticket-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    border-top: 1px solid t.$color-slate-200;
  }

  &__item {
    display: grid;
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: t.$space-6;
    border: 0;
    border-left: 0.25rem solid transparent;
    padding: t.$space-5 t.$space-6;
    background: t.$color-white;
    color: inherit;
    text-align: left;
  }

  &__item:hover {
    background: t.$color-slate-50;
  }

  &__item[data-selected='true'] {
    border-left-color: t.$color-blue-600;
    background: #eff6ff;
  }

  &__main,
  &__side {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  &__main {
    gap: t.$space-1;
  }

  &__side {
    align-items: flex-end;
    justify-content: space-between;
    gap: t.$space-1;
    color: t.$color-slate-600;
    font-size: 0.75rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: t.$space-2;
  }

  &__meta > strong {
    color: t.$color-blue-700;
    font-size: 0.75rem;
  }

  &__title {
    overflow: hidden;
    color: t.$color-navy-950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__customer {
    color: t.$color-slate-600;
    font-size: 0.8125rem;
  }

  &__status,
  &__priority {
    width: max-content;
    border-radius: t.$radius-control;
    padding: 0.125rem t.$space-2;
    background: t.$color-slate-100;
    color: t.$color-slate-700;
    font-size: 0.6875rem;
    font-weight: 800;
  }

  &__status[data-status='in-lavorazione'] {
    background: #eef4ff;
    color: t.$color-blue-700;
  }

  &__status[data-status='in-attesa'] {
    background: t.$color-warning-soft;
    color: t.$color-warning;
  }

  &__status[data-status='risolto'] {
    background: t.$color-success-soft;
    color: t.$color-success;
  }

  &__priority[data-priority='critica'],
  &__priority[data-priority='alta'] {
    background: t.$color-danger-soft;
    color: t.$color-danger;
  }
}

@media (max-width: 36rem) {
  .ticket-list {
    &__item {
      grid-template-columns: 1fr;
      gap: t.$space-4;
      padding-inline: t.$space-4;
    }

    &__side {
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-content: start;
      gap: t.$space-2 t.$space-4;
      align-items: center;
    }

    &__side time {
      grid-column: 1 / -1;
    }
  }
}
```

</details>

### Spiegazione del codice

<details>
<summary>Apri TicketDashboard.tsx completo dopo il TODO 03</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
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
import { TicketDashboardLayout } from './components/TicketDashboardLayout/TicketDashboardLayout';
import { TicketList } from './components/TicketList/TicketList';
import { tickets } from './tickets';
import type { TicketStatusFilter } from './ticket.types';
import './TicketDashboard.scss';

export function TicketDashboard() {
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

  const sidebar = (
          <div
            className="ticket-dashboard__filters"
            aria-labelledby="filters-title"
          >
            <div className="ticket-dashboard__section-title">
              <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
              <h2 id="filters-title">Filtri</h2>
            </div>

            <label className="ticket-dashboard__field">
              <span>Cerca nella coda</span>
              <span className="ticket-dashboard__input-wrap">
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

            <label className="ticket-dashboard__field">
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
              className="ticket-dashboard__reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              Reimposta filtri
            </button>

            <div className="ticket-dashboard__filter-note">
              <strong>{visibleTickets.length}</strong>
              <span>ticket nella vista corrente</span>
            </div>
          </div>
  );

  const queue = (
          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <TicketList
                tickets={visibleTickets}
                selectedTicketId={selectedTicketId}
                onSelect={setSelectedTicketId}
              />
            ) : (
              <div className="ticket-dashboard__empty" role="status">
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
  );

  return (
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
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

        <TicketDashboardLayout sidebar={sidebar}>
          {queue}
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

</details>


`TicketList` possiede il `map` e assegna la key. `TicketListItem` conosce il rendering di una riga. La callback riceve un id primitivo, quindi il proprietario decide cosa fare senza cedere il controllo dello stato.

### Perché facciamo questo passaggio

Puoi testare o riusare la lista passando dati costruiti a mano. La lista non cambia quando cambia la provenienza dei ticket.

### Verifica

- Seleziona ticket in posizioni diverse dopo aver applicato un filtro.
- Controlla `aria-pressed` con gli strumenti del browser.
- Esegui `npm run test` e `npm run build`.

### Errori comuni

- Usare l'indice del `map` come key.
- Importare `tickets.ts` dentro `TicketList`.
- Conservare una seconda copia del ticket selezionato nello stato della riga.

### Checkpoint

- [ ] La lista riceve dati e callback.
- [ ] La key segue `ticket.id`.
- [ ] Ogni riga resta un button accessibile.
- [ ] I test iniziali restano verdi.

---

## TODO 04: aggiungi il pannello di dettaglio

### Obiettivo

Mostra i dati completi del ticket selezionato in una terza area della dashboard.

### Concetto del Modulo 1

Il ticket selezionato è derived state. Puoi ricavarlo dall'id e dalla collezione senza conservare un secondo oggetto nello stato.

### Punto di partenza

Lo stato conserva già `selectedTicketId`. La dashboard calcola `selectedTicket`, ma mostra soltanto l'id nell'intestazione.

### File da modificare

- Crea `components/TicketDetail/TicketDetail.tsx`.
- Crea `components/TicketDetail/TicketDetail.scss`.
- Passa `TicketDetail` allo slot `detail` del layout.

### Passaggi guidati

1. Ricevi `Ticket | null` tramite props.
2. Rendi uno stato iniziale quando il ticket non esiste.
3. Mostra descrizione, cliente, assegnatario, priorità e aggiornamento.
4. Non aggiungere uno stato locale con una copia del ticket.
5. Passa il componente già costruito allo slot `detail`.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri i file completi del dettaglio</summary>

`src/features/tickets/components/TicketDetail/TicketDetail.tsx`

```tsx
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
```

`src/features/tickets/components/TicketDetail/TicketDetail.scss`

```scss
/** Il pannello organizza il contenuto del ticket selezionato. */
@use '../../../../styles/tokens' as t;

.ticket-detail {
  border: 1px solid t.$color-slate-200;
  border-radius: t.$radius-panel;
  padding: t.$space-6;
  background: t.$color-white;
  box-shadow: t.$shadow-panel;

  header span {
    color: t.$color-blue-700;
    font-size: 0.75rem;
    font-weight: 800;
  }

  h2 {
    margin: t.$space-2 0;
    color: t.$color-navy-950;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  header p,
  &__description {
    color: t.$color-slate-600;
  }

  header p {
    margin: 0;
  }

  &__description {
    margin: t.$space-6 0;
  }

  dl,
  dl div {
    display: grid;
    gap: t.$space-2;
  }

  dl {
    margin: 0;
    gap: t.$space-4;
  }

  dl div {
    border-top: 1px solid t.$color-slate-200;
    padding-top: t.$space-4;
  }

  dt {
    color: t.$color-slate-600;
    font-size: 0.75rem;
    font-weight: 700;
  }

  dd {
    display: flex;
    align-items: center;
    gap: t.$space-2;
    margin: 0;
    color: t.$color-navy-950;
    font-weight: 700;
  }

  &--empty {
    text-align: center;
  }
}
```

</details>

<details>
<summary>Apri TicketDashboard.tsx completo dopo il TODO 04</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
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
import { TicketDashboardLayout } from './components/TicketDashboardLayout/TicketDashboardLayout';
import { TicketDetail } from './components/TicketDetail/TicketDetail';
import { TicketList } from './components/TicketList/TicketList';
import { tickets } from './tickets';
import type { TicketStatusFilter } from './ticket.types';
import './TicketDashboard.scss';

export function TicketDashboard() {
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

  const sidebar = (
          <div
            className="ticket-dashboard__filters"
            aria-labelledby="filters-title"
          >
            <div className="ticket-dashboard__section-title">
              <FunnelSimpleIcon size={20} weight="bold" aria-hidden="true" />
              <h2 id="filters-title">Filtri</h2>
            </div>

            <label className="ticket-dashboard__field">
              <span>Cerca nella coda</span>
              <span className="ticket-dashboard__input-wrap">
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

            <label className="ticket-dashboard__field">
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
              className="ticket-dashboard__reset"
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              Reimposta filtri
            </button>

            <div className="ticket-dashboard__filter-note">
              <strong>{visibleTickets.length}</strong>
              <span>ticket nella vista corrente</span>
            </div>
          </div>
  );

  const queue = (
          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <TicketList
                tickets={visibleTickets}
                selectedTicketId={selectedTicketId}
                onSelect={setSelectedTicketId}
              />
            ) : (
              <div className="ticket-dashboard__empty" role="status">
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
  );

  return (
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
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

        <TicketDashboardLayout
          sidebar={sidebar}
          detail={<TicketDetail ticket={selectedTicket ?? null} />}
        >
          {queue}
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

</details>


Nel chiamante componi il layout in questo modo:

```tsx
<TicketDashboardLayout
  sidebar={sidebar}
  detail={<TicketDetail ticket={selectedTicket ?? null} />}
>
  {queue}
</TicketDashboardLayout>
```

### Spiegazione del codice

`TicketDetail` riceve il valore già risolto. Il componente non conosce `selectedTicketId` e non cerca dati. Il chiamante mantiene la regola che collega selezione e collezione.

### Perché facciamo questo passaggio

La UI del dettaglio può cambiare senza toccare il modo in cui selezioni un ticket. La selezione può cambiare senza riscrivere il pannello.

### Verifica

- Seleziona tre ticket e controlla che titolo, cliente e assegnatario cambino.
- Riduci la finestra sotto 768 pixel e verifica l'ordine filtri, lista, dettaglio.
- Esegui `npm run check`.

### Errori comuni

- Salvare `selectedTicket` con `useState` oltre a `selectedTicketId`.
- Cercare il ticket dentro `TicketDetail` importando le fixture.
- Usare un `div` cliccabile al posto dei button già presenti nella lista.

### Checkpoint

- [ ] Il dettaglio dipende soltanto dalle props.
- [ ] Il ticket selezionato deriva da id e collezione.
- [ ] Lo slot `detail` contiene un nodo già costruito.
- [ ] La vista mobile non produce overflow orizzontale.

---

## TODO 05: rendi controllati ricerca e filtri

### Obiettivo

Estrai i controlli in un componente che riceve valori e callback dal proprietario dello stato.

### Concetto del Modulo 1

Un input controllato mostra il valore ricevuto da React e comunica ogni modifica tramite una callback. Lista e filtri condividono lo stesso proprietario perché entrambi dipendono da query e stato.

### Punto di partenza

Il markup dei filtri vive ancora nel componente principale. Spostarlo senza definire un contratto porterebbe lo stato dentro il nuovo componente e creerebbe una seconda fonte di verità.

### File da modificare

- Crea `components/TicketFilters/TicketFilters.tsx`.
- Crea `components/TicketFilters/TicketFilters.scss`.
- Sostituisci lo slot `sidebar` nel chiamante.

### Passaggi guidati

1. Definisci props per query, stato, callback e reset.
2. Passa il valore dell'input tramite `value`.
3. Passa il valore della select tramite `value`.
4. Comunica le modifiche con `onQueryChange` e `onStatusChange`.
5. Disabilita il reset quando i filtri sono già allo stato iniziale.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri i file completi dei filtri</summary>

`src/features/tickets/components/TicketFilters/TicketFilters.tsx`

```tsx
/** TicketFilters rende controlli controllati e non conserva copie locali. */
import {
  ArrowClockwiseIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
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
      <button type="button" onClick={onReset} disabled={!hasActiveFilters}>
        <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
        Reimposta filtri
      </button>
      <p className="ticket-filters__result">
        <strong>{resultCount}</strong> ticket nella vista corrente
      </p>
    </div>
  );
}
```

`src/features/tickets/components/TicketFilters/TicketFilters.scss`

```scss
/** I controlli mantengono label visibili, focus e contrasto. */
@use '../../../../styles/tokens' as t;

.ticket-filters {
  display: grid;
  gap: t.$space-5;
  border: 1px solid t.$color-slate-200;
  border-radius: t.$radius-panel;
  padding: t.$space-5;
  background: t.$color-white;
  box-shadow: t.$shadow-panel;

  &__title {
    display: flex;
    align-items: center;
    gap: t.$space-2;
    color: t.$color-navy-900;
  }

  &__title h2,
  &__result {
    margin: 0;
  }

  &__title h2 {
    font-size: 1rem;
  }

  &__field {
    display: grid;
    gap: t.$space-2;
    color: t.$color-slate-700;
    font-size: 0.8125rem;
    font-weight: 700;
  }

  &__field select,
  &__search {
    min-height: 2.75rem;
    border: 1px solid t.$color-slate-300;
    border-radius: t.$radius-control;
    background: t.$color-white;
  }

  &__field select {
    width: 100%;
    padding-inline: t.$space-3;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: t.$space-2;
    padding-inline: t.$space-3;
  }

  &__search:focus-within {
    outline: 0.1875rem solid t.$color-blue-600;
    outline-offset: 0.1875rem;
  }

  &__search input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
  }

  > button {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    gap: t.$space-2;
    border: 1px solid t.$color-blue-600;
    border-radius: t.$radius-control;
    background: t.$color-white;
    color: t.$color-blue-700;
    font-weight: 800;
  }

  > button:disabled {
    border-color: t.$color-slate-200;
    color: t.$color-slate-500;
    cursor: not-allowed;
  }

  &__result {
    border-top: 1px solid t.$color-slate-200;
    padding-top: t.$space-4;
    color: t.$color-slate-600;
    font-size: 0.75rem;
  }

  &__result strong {
    margin-right: t.$space-1;
    color: t.$color-navy-900;
    font-size: 1.5rem;
  }
}
```

</details>

<details>
<summary>Apri TicketDashboard.tsx completo dopo il TODO 05</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
 * stato, dati derivati, filtri, lista e riepilogo vivono nello stesso file.
 * Lo starter funziona, mentre i TODO mostreranno come separare questi confini.
 */
import { useState } from 'react';
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { TicketDashboardLayout } from './components/TicketDashboardLayout/TicketDashboardLayout';
import { TicketDetail } from './components/TicketDetail/TicketDetail';
import { TicketFilters } from './components/TicketFilters/TicketFilters';
import { TicketList } from './components/TicketList/TicketList';
import { tickets } from './tickets';
import type { TicketStatusFilter } from './ticket.types';
import './TicketDashboard.scss';

export function TicketDashboard() {
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

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  function resetFilters() {
    setQuery('');
    setStatusFilter('tutti');
  }

  const sidebar = (
    <TicketFilters
      query={query}
      status={statusFilter}
      resultCount={visibleTickets.length}
      onQueryChange={setQuery}
      onStatusChange={setStatusFilter}
      onReset={resetFilters}
    />
  );

  const queue = (
          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <TicketList
                tickets={visibleTickets}
                selectedTicketId={selectedTicketId}
                onSelect={setSelectedTicketId}
              />
            ) : (
              <div className="ticket-dashboard__empty" role="status">
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
  );

  return (
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
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

        <TicketDashboardLayout
          sidebar={sidebar}
          detail={<TicketDetail ticket={selectedTicket ?? null} />}
        >
          {queue}
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

</details>


Componi lo slot in questo modo:

```tsx
sidebar={
  <TicketFilters
    query={query}
    status={statusFilter}
    resultCount={visibleTickets.length}
    onQueryChange={setQuery}
    onStatusChange={setStatusFilter}
    onReset={resetFilters}
  />
}
```

### Spiegazione del codice

Il componente usa ogni prop che riceve. Il layout riceve il nodo `TicketFilters` già configurato e non inoltra query o callback. La condizione del button reset deriva dalle props correnti.

### Perché facciamo questo passaggio

Lista e filtri leggono la stessa fonte di verità. Il componente resta prevedibile anche quando un altro proprietario controllerà i valori.

### Verifica

- Digita una query carattere per carattere e osserva il valore nell'input.
- Cambia stato, poi usa reset.
- Controlla che il button reset torni disabilitato.
- Esegui `npm run check`.

### Errori comuni

- Aggiungere `useState(props.query)` dentro `TicketFilters`.
- Usare il placeholder come unica label.
- Passare query e callback attraverso `TicketDashboardLayout`.

### Checkpoint

- [ ] I controlli sono controllati.
- [ ] La sidebar usa composition.
- [ ] Il reset ha una sola callback.
- [ ] La ricerca conserva il comportamento iniziale.

---

## TODO 06: estrai il custom hook di dominio

### Obiettivo

Sposta stato, filtri e valori derivati in `useTicketDashboard`.

### Concetto del Modulo 1

Un custom hook isola comportamento riusabile. Restituisce dati e azioni, mentre i componenti continuano a occuparsi del rendering.

### Punto di partenza

`TicketDashboard` dichiara tre `useState`, calcola conteggi e filtra le fixture. Queste regole occupano la parte iniziale del componente e rendono più difficile leggere il JSX.

### File da modificare

- Crea `hooks/useTicketDashboard.ts`.
- Rimuovi stato e calcoli dal componente.
- Usa il risultato nominato del custom hook.

### Passaggi guidati

1. Passa l'array iniziale come argomento del hook.
2. Sposta query, stato del filtro e id selezionato.
3. Calcola lista visibile, ticket selezionato e conteggi durante il render del hook.
4. Esponi setter con nomi di dominio.
5. Non restituire elementi React.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri il file completo del custom hook</summary>

`src/features/tickets/hooks/useTicketDashboard.ts`

```ts
/**
 * Il hook possiede lo stato UI e calcola i valori derivati.
 * L'array arriva come dipendenza, quindi il hook non importa fixture.
 */
import { useState } from 'react';
import type { Ticket, TicketStatusFilter } from '../ticket.types';

export function useTicketDashboard(allTickets: Ticket[]) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('tutti');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    allTickets[0]?.id ?? null,
  );

  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');
  const visibleTickets = allTickets.filter((ticket) => {
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

  const selectedTicket =
    allTickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const summary = {
    total: allTickets.length,
    open: allTickets.filter((ticket) => ticket.status !== 'risolto').length,
    urgent: allTickets.filter(
      (ticket) => ticket.priority === 'critica' || ticket.priority === 'alta',
    ).length,
    waiting: allTickets.filter((ticket) => ticket.status === 'in-attesa').length,
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
    visibleTickets,
    summary,
    setQuery,
    setStatusFilter,
    selectTicket: setSelectedTicketId,
    resetFilters,
  };
}
```

</details>

Nel componente usa proprietà nominate:

```tsx
const {
  query,
  statusFilter,
  selectedTicketId,
  selectedTicket,
  visibleTickets,
  summary,
  setQuery,
  setStatusFilter,
  selectTicket,
  resetFilters,
} = useTicketDashboard(tickets);
```

### Spiegazione del codice

<details>
<summary>Apri TicketDashboard.tsx completo dopo il TODO 06</summary>

`src/features/tickets/TicketDashboard.tsx`

```tsx
/**
 * TicketDashboard contiene intenzionalmente più responsabilità:
 * stato, dati derivati, filtri, lista e riepilogo vivono nello stesso file.
 * Lo starter funziona, mentre i TODO mostreranno come separare questi confini.
 */
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { TicketDashboardLayout } from './components/TicketDashboardLayout/TicketDashboardLayout';
import { TicketDetail } from './components/TicketDetail/TicketDetail';
import { TicketFilters } from './components/TicketFilters/TicketFilters';
import { useTicketDashboard } from './hooks/useTicketDashboard';
import { TicketList } from './components/TicketList/TicketList';
import { tickets } from './tickets';
import './TicketDashboard.scss';

export function TicketDashboard() {
  const {
    query,
    statusFilter,
    selectedTicketId,
    selectedTicket,
    visibleTickets,
    summary,
    setQuery,
    setStatusFilter,
    selectTicket,
    resetFilters,
  } = useTicketDashboard(tickets);

  const sidebar = (
    <TicketFilters
      query={query}
      status={statusFilter}
      resultCount={visibleTickets.length}
      onQueryChange={setQuery}
      onStatusChange={setStatusFilter}
      onReset={resetFilters}
    />
  );

  const queue = (
          <section
            className="ticket-dashboard__queue"
            aria-labelledby="queue-title"
          >
            <header className="ticket-dashboard__queue-header">
              <div>
                <h2 id="queue-title">Coda ticket</h2>
                <p>Ordine di aggiornamento, dal più recente.</p>
              </div>
              <span>{visibleTickets.length} risultati</span>
            </header>

            {visibleTickets.length > 0 ? (
              <TicketList
                tickets={visibleTickets}
                selectedTicketId={selectedTicketId}
                onSelect={selectTicket}
              />
            ) : (
              <div className="ticket-dashboard__empty" role="status">
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
  );

  return (
    <div className="ticket-dashboard">
      <header className="ticket-dashboard__topbar">
        <a className="ticket-dashboard__brand" href="#main-content">
          <span className="ticket-dashboard__brand-mark" aria-hidden="true">
            <BuildingsIcon size={20} weight="bold" />
          </span>
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
        <span className="ticket-dashboard__environment">
          Ambiente didattico
        </span>
      </header>

      <main id="main-content" className="ticket-dashboard__main">
        <header className="ticket-dashboard__heading">
          <div>
            <p className="ticket-dashboard__context">Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <p>
              Controlla le richieste aperte, filtra la coda e assegna la
              priorità al prossimo intervento.
            </p>
          </div>
          <div className="ticket-dashboard__selection" aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>

        <section
          className="ticket-dashboard__metrics"
          aria-label="Riepilogo ticket"
        >
          <article>
            <TicketIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Totali</span>
            <strong>{summary.total}</strong>
          </article>
          <article>
            <ClockIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Aperti</span>
            <strong>{summary.open}</strong>
          </article>
          <article>
            <WarningIcon size={20} weight="duotone" aria-hidden="true" />
            <span>Alta priorità</span>
            <strong>{summary.urgent}</strong>
          </article>
          <article>
            <CheckCircleIcon size={20} weight="duotone" aria-hidden="true" />
            <span>In attesa</span>
            <strong>{summary.waiting}</strong>
          </article>
        </section>

        <TicketDashboardLayout
          sidebar={sidebar}
          detail={<TicketDetail ticket={selectedTicket ?? null} />}
        >
          {queue}
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

</details>


`query`, `statusFilter` e `selectedTicketId` rappresentano decisioni dell'utente. Lista, dettaglio e conteggi derivano da questi valori. Il hook ricalcola valori semplici durante il render e mantiene una sola fonte di verità.

### Perché facciamo questo passaggio

Il componente principale può concentrarsi sulla composizione. Il hook può ricevere fixture, dati di test o risultati provenienti da un servizio senza cambiare il markup.

### Verifica

- Controlla che il hook non importi `tickets.ts`.
- Controlla che il hook non restituisca JSX.
- Cerca Effect usati per sincronizzare conteggi o lista. Non devono esistere.
- Esegui `npm run check`.

### Errori comuni

- Restituire `<TicketList />` dal hook.
- Conservare `visibleTickets` con `useState`.
- Aggiungere `useMemo` senza aver misurato un calcolo costoso.

### Checkpoint

- [ ] Il hook espone dati e azioni nominate.
- [ ] Lo stato derivato non viene duplicato.
- [ ] Le fixture entrano come argomento.
- [ ] Il rendering non cambia.

---

## TODO 07: separa container e view

### Obiettivo

Assegna l'orchestrazione a `TicketDashboardContainer` e il rendering a `TicketDashboardView`.

### Concetto del Modulo 1

Il container collega dipendenze e custom hook. La view riceve un contratto e può essere renderizzata con dati costruiti a mano.

### Punto di partenza

`TicketDashboard` chiama il hook e compone la UI nello stesso file. Il confine è più leggibile, ma rendering e orchestrazione cambiano ancora insieme.

### File da modificare

- Crea `containers/TicketDashboardContainer.tsx`.
- Crea `components/TicketDashboardView/TicketDashboardView.tsx` e il relativo Sass.
- Sposta la composizione visuale nella view.
- Aggiorna l'API pubblica e `App.tsx`.
- Sposta il test accanto al container e aggiorna il componente renderizzato.
- Elimina i vecchi `TicketDashboard.tsx` e `TicketDashboard.scss` dopo aver
  spostato rendering e stili nella view.

### Passaggi guidati

1. Definisci props con dati primitivi, oggetti di dominio e callback.
2. Sposta header, metriche, layout, filtri, lista e dettaglio nella view.
3. Chiama `useTicketDashboard` nel container.
4. Adatta il risultato del hook alle props della view.
5. Esporta soltanto il container dalla feature.
6. Sposta `TicketDashboard.test.tsx` in
   `containers/TicketDashboardContainer.test.tsx` e importa il container.
7. Elimina `TicketDashboard.tsx` e `TicketDashboard.scss`, ormai sostituiti da
   container, view e component pairing.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri i file completi di container e view</summary>

`src/features/tickets/containers/TicketDashboardContainer.tsx`

```tsx
/** Il container collega fixture, hook e contratto della view. */
import { TicketDashboardView } from '../components/TicketDashboardView/TicketDashboardView';
import { useTicketDashboard } from '../hooks/useTicketDashboard';
import { tickets } from '../tickets';

export function TicketDashboardContainer() {
  const dashboard = useTicketDashboard(tickets);

  return (
    <TicketDashboardView
      tickets={dashboard.visibleTickets}
      selectedTicketId={dashboard.selectedTicketId}
      selectedTicket={dashboard.selectedTicket}
      query={dashboard.query}
      statusFilter={dashboard.statusFilter}
      summary={dashboard.summary}
      onQueryChange={dashboard.setQuery}
      onStatusChange={dashboard.setStatusFilter}
      onSelectTicket={dashboard.selectTicket}
      onResetFilters={dashboard.resetFilters}
    />
  );
}
```

`src/features/tickets/components/TicketDashboardView/TicketDashboardView.tsx`

```tsx
/** La view compone componenti presentazionali e non conosce le fixture. */
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import type { Ticket, TicketStatusFilter } from '../../ticket.types';
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
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TicketStatusFilter) => void;
  onSelectTicket: (ticketId: string) => void;
  onResetFilters: () => void;
};

export function TicketDashboardView({
  tickets,
  selectedTicketId,
  selectedTicket,
  query,
  statusFilter,
  summary,
  onQueryChange,
  onStatusChange,
  onSelectTicket,
  onResetFilters,
}: TicketDashboardViewProps) {
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
  const detail = <TicketDetail ticket={selectedTicket} />;

  return (
    <div className="ticket-dashboard-view">
      <header className="ticket-dashboard-view__topbar">
        <a href="#main-content" className="ticket-dashboard-view__brand">
          <BuildingsIcon size={20} weight="bold" aria-hidden="true" />
          <span><strong>Control Room</strong><small>Operations support</small></span>
        </a>
        <span>Ambiente didattico</span>
      </header>
      <main id="main-content" className="ticket-dashboard-view__main">
        <header className="ticket-dashboard-view__heading">
          <div>
            <p>Coda assistenza</p>
            <h1>Operations Dashboard</h1>
            <span>Controlla le richieste aperte e assegna la priorità al prossimo intervento.</span>
          </div>
          <div aria-live="polite">
            <span>Ticket selezionato</span>
            <strong>{selectedTicket?.id ?? 'Nessuno'}</strong>
          </div>
        </header>
        <section className="ticket-dashboard-view__metrics" aria-label="Riepilogo ticket">
          <article><TicketIcon size={20} aria-hidden="true" /><span>Totali</span><strong>{summary.total}</strong></article>
          <article><ClockIcon size={20} aria-hidden="true" /><span>Aperti</span><strong>{summary.open}</strong></article>
          <article><WarningIcon size={20} aria-hidden="true" /><span>Alta priorità</span><strong>{summary.urgent}</strong></article>
          <article><CheckCircleIcon size={20} aria-hidden="true" /><span>In attesa</span><strong>{summary.waiting}</strong></article>
        </section>
        <TicketDashboardLayout sidebar={sidebar} detail={detail}>
          <section className="ticket-dashboard-view__queue" aria-labelledby="queue-title">
            <header><div><h2 id="queue-title">Coda ticket</h2><p>Ordine di aggiornamento, dal più recente.</p></div><span>{tickets.length} risultati</span></header>
            {tickets.length > 0 ? (
              <TicketList tickets={tickets} selectedTicketId={selectedTicketId} onSelect={onSelectTicket} />
            ) : (
              <div className="ticket-dashboard-view__empty" role="status">
                <MagnifyingGlassIcon size={28} aria-hidden="true" />
                <h3>Nessun ticket trovato</h3>
                <p>Modifica la ricerca oppure reimposta i filtri.</p>
                <button type="button" onClick={onResetFilters}>Mostra tutti i ticket</button>
              </div>
            )}
          </section>
        </TicketDashboardLayout>
      </main>
    </div>
  );
}
```

`src/features/tickets/components/TicketDashboardView/TicketDashboardView.scss`

```scss
/** La view definisce il ritmo generale senza conoscere logica e dati. */
@use '../../../../styles/tokens' as t;

.ticket-dashboard-view {
  min-height: 100dvh;
  background: t.$color-slate-50;

  &__topbar {
    display: flex;
    min-height: 4.5rem;
    align-items: center;
    justify-content: space-between;
    padding: t.$space-3 clamp(t.$space-4, 4vw, t.$space-10);
    background: t.$color-navy-900;
    color: t.$color-white;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: t.$space-3;
    color: inherit;
    text-decoration: none;
  }

  &__brand strong,
  &__brand small {
    display: block;
  }

  &__brand small {
    color: t.$color-slate-300;
    font-size: 0.75rem;
  }

  &__main {
    width: min(100% - 2rem, 90rem);
    margin-inline: auto;
    padding-block: clamp(t.$space-6, 4vw, t.$space-10);
  }

  &__heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: t.$space-6;
    margin-bottom: t.$space-8;
  }

  &__heading h1 {
    margin: t.$space-1 0 t.$space-2;
    color: t.$color-navy-950;
    font-size: clamp(2rem, 4vw, 3.25rem);
  }

  &__heading p,
  &__heading span {
    color: t.$color-slate-600;
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: t.$space-6;
    overflow: hidden;
    border: 1px solid t.$color-slate-200;
    border-radius: t.$radius-panel;
    background: t.$color-white;
  }

  &__metrics article {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: t.$space-2 t.$space-3;
    padding: t.$space-5;
  }

  &__metrics article + article {
    border-left: 1px solid t.$color-slate-200;
  }

  &__metrics svg {
    grid-row: 1 / 3;
    color: t.$color-blue-700;
  }

  &__queue {
    overflow: hidden;
    border: 1px solid t.$color-slate-200;
    border-radius: t.$radius-panel;
    background: t.$color-white;
    box-shadow: t.$shadow-panel;
  }

  &__queue > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: t.$space-5 t.$space-6;
    background: t.$color-slate-50;
  }

  &__queue h2,
  &__queue p {
    margin: 0;
  }

  &__empty {
    display: grid;
    min-height: 20rem;
    place-items: center;
    align-content: center;
    gap: t.$space-2;
    padding: t.$space-8;
    text-align: center;
  }
}

@media (max-width: 64rem) {
  .ticket-dashboard-view__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 48rem) {
  .ticket-dashboard-view__heading {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 36rem) {
  .ticket-dashboard-view__metrics {
    grid-template-columns: 1fr;
  }
}
```

</details>

Aggiorna `src/features/tickets/index.ts`:

```ts
export { TicketDashboardContainer } from './containers/TicketDashboardContainer';
export type { Ticket, TicketPriority, TicketStatus, TicketStatusFilter } from './ticket.types';
```

Aggiorna `src/App.tsx`:

```tsx
import { TicketDashboardContainer } from './features/tickets';

export function App() {
  return <TicketDashboardContainer />;
}
```

Nel test cambia il percorso e il componente renderizzato. Le asserzioni restano
le stesse perché in questo TODO il comportamento non cambia:

```tsx
import { TicketDashboardContainer } from './TicketDashboardContainer';

// Dentro ogni test sostituisci il render precedente con questo.
render(<TicketDashboardContainer />);
```

<details>
<summary>Apri TicketDashboardContainer.test.tsx completo dopo il TODO 07</summary>

`src/features/tickets/containers/TicketDashboardContainer.test.tsx`

```tsx
/**
 * I test descrivono il comportamento che deve restare stabile durante il refactoring.
 * Gli studenti non devono conoscere la struttura interna del componente.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDashboardContainer } from './TicketDashboardContainer';

describe('TicketDashboardContainer', () => {
  it('mostra il riepilogo e la coda iniziale', () => {
    render(<TicketDashboardContainer />);

    expect(
      screen.getByRole('heading', { name: 'Operations Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1847.*Ordini bloccati nel controllo disponibilità/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('filtra i ticket usando la ricerca controllata', async () => {
    const user = userEvent.setup();
    render(<TicketDashboardContainer />);

    await user.type(screen.getByRole('searchbox'), 'Fonderie Lario');

    expect(screen.getByText('1 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1796.*Data consegna spostata di un giorno/i,
      }),
    ).toBeInTheDocument();
  });

  it('combina filtro per stato e reset', async () => {
    const user = userEvent.setup();
    render(<TicketDashboardContainer />);

    await user.selectOptions(screen.getByLabelText('Stato'), 'in-attesa');
    expect(screen.getByText('3 risultati')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reimposta filtri' }));
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });

  it('aggiorna la selezione senza dipendere dalla posizione in lista', async () => {
    const user = userEvent.setup();
    render(<TicketDashboardContainer />);
    const ticketButton = screen.getByRole('button', {
      name: /OPS-1839.*Doppia notifica per le richieste approvate/i,
    });

    await user.click(ticketButton);

    expect(ticketButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('mostra un empty state e permette di tornare alla coda', async () => {
    const user = userEvent.setup();
    render(<TicketDashboardContainer />);

    await user.type(screen.getByRole('searchbox'), 'testo senza risultati');
    expect(screen.getByRole('status')).toHaveTextContent('Nessun ticket trovato');

    await user.click(
      screen.getByRole('button', { name: 'Mostra tutti i ticket' }),
    );
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });
});
```

</details>

### Spiegazione del codice

Il container sceglie la sorgente dati e chiama il hook. La view riceve un contratto completo e compone nodi presentazionali. Puoi renderizzare la view in un test senza importare fixture o simulare un servizio.

### Perché facciamo questo passaggio

Orchestrazione e rendering cambiano per ragioni diverse. Il confine rende visibile la direzione dei dati e riduce il costo dei test isolati.

### Verifica

- Cerca import di `tickets.ts` dentro i componenti. Non devono esistere.
- Cerca `useTicketDashboard` dentro la view. Non deve esistere.
- Esegui `npm run check`.

### Errori comuni

- Chiamare il hook nella view e lasciare il container vuoto.
- Passare l'intero risultato del hook con spread senza dichiarare il contratto.
- Esportare ogni componente interno dall'API pubblica.

### Checkpoint

- [ ] Il container orchestra.
- [ ] La view renderizza props.
- [ ] `App` importa soltanto il container pubblico.
- [ ] Il test renderizza il container dal nuovo percorso.
- [ ] I test restano basati sul comportamento.

---

## TODO 08: introduci servizio locale e retry

### Obiettivo

Carica i ticket tramite un contratto asincrono e gestisci loading, errore, empty state e retry.

### Concetto del Modulo 1

Dependency injection rende esplicita la sorgente dati. Un Effect sincronizza React con il servizio e usa una cleanup per annullare il lavoro precedente.

### Punto di partenza

Il container importa direttamente le fixture. Il custom hook riceve già un array, quindi il rendering è separato dalla provenienza dei dati. Ora puoi sostituire la sorgente senza modificare la view.

### File da modificare

- Aggiungi `TicketFiltersValue` a `ticket.types.ts`.
- Crea `services/TicketService.ts`.
- Crea `services/createLocalTicketService.ts`.
- Crea `hooks/useTickets.ts`.
- Aggiorna `useTicketDashboard` e il container.
- Crea `components/StatePanel/StatePanel.tsx` e il relativo Sass.
- Aggiorna la view per scegliere lo stato da mostrare.
- Aggiorna il test del container per attendere il caricamento asincrono.

### Passaggi guidati

1. Definisci un'interfaccia con `list(filters, signal)`.
2. Implementa un servizio locale che restituisce una Promise dopo 450 ms.
3. Usa `AbortSignal` per cancellare timer e Promise obsolete.
4. Crea `useTickets` con stato `idle`, `loading`, `success`, `error`.
5. Usa un contatore `reloadKey` per il retry.
6. Configura `?scenario=error-once` nel container.
7. Rendi gli stati applicativi dentro la view.

### Codice da scrivere e stato finale dei file

Aggiungi questo tipo a `ticket.types.ts`:

```ts
export type TicketFiltersValue = {
  query: string;
  status: TicketStatusFilter;
};

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
```

<details>
<summary>Apri il contratto e il servizio locale completi</summary>

`src/features/tickets/services/TicketService.ts`

```ts
/** Il contratto descrive cosa serve alla feature, senza imporre una tecnologia. */
import type { Ticket, TicketFiltersValue } from '../ticket.types';

export interface TicketService {
  list(filters: TicketFiltersValue, signal: AbortSignal): Promise<Ticket[]>;
}
```

`src/features/tickets/services/createLocalTicketService.ts`

```ts
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
  let hasFailed = false;

  return {
    list(filters: TicketFiltersValue, signal: AbortSignal) {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException('Richiesta annullata', 'AbortError'));
          return;
        }

        const timerId = window.setTimeout(() => {
          signal.removeEventListener('abort', handleAbort);

          if (failFirstRequest && !hasFailed) {
            hasFailed = true;
            reject(new Error('Il servizio ticket non è disponibile.'));
            return;
          }

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
          window.clearTimeout(timerId);
          reject(new DOMException('Richiesta annullata', 'AbortError'));
        }

        signal.addEventListener('abort', handleAbort, { once: true });
      });
    },
  };
}
```

</details>

<details>
<summary>Apri useTickets completo</summary>

`src/features/tickets/hooks/useTickets.ts`

```ts
/** useTickets sincronizza filtri React e servizio dati. */
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
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    service
      .list({ query, status: statusFilter }, controller.signal)
      .then((result) => {
        setTickets(result);
        setStatus('success');
      })
      .catch((requestError: unknown) => {
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
  }, [query, reloadKey, service, statusFilter]);

  function retry() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  return { tickets, status, error, retry };
}
```

</details>

<details>
<summary>Apri useTicketDashboard aggiornato</summary>

`src/features/tickets/hooks/useTicketDashboard.ts`

```ts
/** Il hook di dominio compone stato UI e accesso dati. */
import { useState } from 'react';
import type { TicketStatusFilter } from '../ticket.types';
import type { TicketService } from '../services/TicketService';
import { useTickets } from './useTickets';

export function useTicketDashboard(service: TicketService) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('tutti');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const remote = useTickets(query, statusFilter, service);

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
    retry: remote.retry,
    setQuery,
    setStatusFilter,
    selectTicket: setSelectedTicketId,
    resetFilters,
  };
}
```

</details>

<details>
<summary>Apri il container aggiornato</summary>

`src/features/tickets/containers/TicketDashboardContainer.tsx`

```tsx
/** Il container crea la dipendenza stabile e adatta il hook alla view. */
import { TicketDashboardView } from '../components/TicketDashboardView/TicketDashboardView';
import { useTicketDashboard } from '../hooks/useTicketDashboard';
import { createLocalTicketService } from '../services/createLocalTicketService';

const shouldFailOnce =
  new URLSearchParams(window.location.search).get('scenario') === 'error-once';
const ticketService = createLocalTicketService({ failFirstRequest: shouldFailOnce });

export function TicketDashboardContainer() {
  const dashboard = useTicketDashboard(ticketService);

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
      onQueryChange={dashboard.setQuery}
      onStatusChange={dashboard.setStatusFilter}
      onSelectTicket={dashboard.selectTicket}
      onResetFilters={dashboard.resetFilters}
      onRetry={dashboard.retry}
    />
  );
}
```

</details>

<details>
<summary>Apri StatePanel completo</summary>

`src/features/tickets/components/StatePanel/StatePanel.tsx`

```tsx
/** StatePanel presenta i tre esiti che sostituiscono la lista. */
import {
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import './StatePanel.scss';

type StatePanelProps =
  | { state: 'loading' }
  | { state: 'empty'; onReset: () => void }
  | { state: 'error'; message: string; onRetry: () => void };

export function StatePanel(props: StatePanelProps) {
  if (props.state === 'loading') {
    return (
      <div className="state-panel" role="status" aria-label="Caricamento ticket">
        <div className="state-panel__skeleton" aria-hidden="true" />
        <div className="state-panel__skeleton" aria-hidden="true" />
        <span>Caricamento della coda</span>
      </div>
    );
  }

  if (props.state === 'error') {
    return (
      <div className="state-panel" role="alert">
        <WarningCircleIcon size={30} weight="duotone" aria-hidden="true" />
        <h3>Non posso caricare i ticket</h3>
        <p>{props.message}</p>
        <button type="button" onClick={props.onRetry}>
          <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="state-panel" role="status">
      <MagnifyingGlassIcon size={30} weight="duotone" aria-hidden="true" />
      <h3>Nessun ticket trovato</h3>
      <p>Modifica la ricerca oppure reimposta i filtri.</p>
      <button type="button" onClick={props.onReset}>Mostra tutti i ticket</button>
    </div>
  );
}
```

`src/features/tickets/components/StatePanel/StatePanel.scss`

```scss
/** Il pannello mantiene dimensioni stabili tra loading, errore ed empty state. */
@use '../../../../styles/tokens' as t;

.state-panel {
  display: grid;
  min-height: 20rem;
  place-items: center;
  align-content: center;
  gap: t.$space-3;
  padding: t.$space-8;
  text-align: center;

  h3,
  p {
    margin: 0;
  }

  p,
  > span {
    color: t.$color-slate-600;
  }

  button {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    gap: t.$space-2;
    margin-top: t.$space-2;
    border: 0;
    border-radius: t.$radius-control;
    padding-inline: t.$space-4;
    background: t.$color-blue-600;
    color: t.$color-white;
    font-weight: 800;
  }

  &__skeleton {
    width: min(100%, 28rem);
    height: 4rem;
    border-radius: t.$radius-control;
    background: t.$color-slate-100;
  }
}
```

</details>

Aggiorna le props della view con:

```ts
loadStatus: LoadStatus;
error: string | null;
onRetry: () => void;
```

Importa `LoadStatus` e `StatePanel`, poi sostituisci il contenuto della coda con questa selezione:

```tsx
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
```

<details>
<summary>Apri tipi e view completi dopo il TODO 08</summary>

`src/features/tickets/ticket.types.ts`

```ts
/** I tipi definiscono il vocabolario condiviso dalla feature tickets. */
export type TicketStatus =
  | 'nuovo'
  | 'in-lavorazione'
  | 'in-attesa'
  | 'risolto';

export type TicketPriority = 'critica' | 'alta' | 'media' | 'bassa';

export type Ticket = {
  id: string;
  title: string;
  customer: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  updatedAt: string;
};

export type TicketStatusFilter = TicketStatus | 'tutti';

export type TicketFiltersValue = {
  query: string;
  status: TicketStatusFilter;
};

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
```

`src/features/tickets/components/TicketDashboardView/TicketDashboardView.tsx`

```tsx
/** La view compone la UI usando soltanto dati, stati e callback ricevuti. */
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
  onQueryChange,
  onStatusChange,
  onSelectTicket,
  onResetFilters,
  onRetry,
}: TicketDashboardViewProps) {
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
      <header className="ticket-dashboard-view__topbar">
        <a href="#main-content" className="ticket-dashboard-view__brand">
          <BuildingsIcon size={20} weight="bold" aria-hidden="true" />
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
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
                {tickets.length} risultati
              </span>
            </header>

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
```

</details>


### Stato finale del test asincrono

Il test non deve più cercare i risultati subito dopo `render`. Il servizio locale
impiega 450 ms, quindi prima osservi il loading e poi attendi l'interfaccia
finale. Sostituisci il contenuto del test del container con questo file.

<details>
<summary>Apri TicketDashboardContainer.test.tsx completo</summary>

`src/features/tickets/containers/TicketDashboardContainer.test.tsx`

```tsx
/**
 * I test esercitano il flusso visibile del container.
 * findBy e waitFor attendono il servizio senza conoscere il suo timer interno.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketDashboardContainer } from './TicketDashboardContainer';

const asyncOptions = { timeout: 2_000 };

async function renderLoadedDashboard() {
  render(<TicketDashboardContainer />);

  expect(screen.getByRole('status', { name: 'Caricamento ticket' }))
    .toBeInTheDocument();
  await screen.findByText('12 risultati', {}, asyncOptions);
}

describe('TicketDashboardContainer', () => {
  it('mostra il riepilogo e la coda iniziale', async () => {
    await renderLoadedDashboard();

    expect(
      screen.getByRole('heading', { name: 'Operations Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });

  it('filtra i ticket usando la ricerca controllata', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.type(screen.getByRole('searchbox'), 'Fonderie Lario');

    expect(
      await screen.findByText('1 risultati', {}, asyncOptions),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1796.*Data consegna spostata di un giorno/i,
      }),
    ).toBeInTheDocument();
  });

  it('combina filtro per stato e reset', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.selectOptions(screen.getByLabelText('Stato'), 'in-attesa');
    expect(
      await screen.findByText('3 risultati', {}, asyncOptions),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reimposta filtri' }));
    await waitFor(
      () => expect(screen.getByText('12 risultati')).toBeInTheDocument(),
      asyncOptions,
    );
  });

  it('seleziona un ticket usando il suo id stabile', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();
    const ticketButton = screen.getByRole('button', {
      name: /OPS-1839.*Doppia notifica per le richieste approvate/i,
    });

    await user.click(ticketButton);

    expect(ticketButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('mostra un empty state e permette di tornare alla coda', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.type(screen.getByRole('searchbox'), 'testo senza risultati');
    expect(
      await screen.findByText('Nessun ticket trovato', {}, asyncOptions),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Mostra tutti i ticket' }),
    );
    expect(
      await screen.findByText('12 risultati', {}, asyncOptions),
    ).toBeInTheDocument();
  });
});
```

</details>

### Spiegazione del codice

Il servizio riceve filtri e signal. `useTickets` crea il controller dentro l'Effect e lo annulla nella cleanup. Il retry incrementa una chiave interna, che risincronizza lo stesso Effect senza esporre dettagli alla view.

### Perché facciamo questo passaggio

La UI dipende da un contratto. Puoi sostituire il servizio locale con un adattatore HTTP nel modulo dedicato ai dati senza riscrivere lista, filtri e dettaglio.

### Verifica

1. Apri la dashboard e osserva il loading skeleton.
2. Cerca un testo senza risultati e controlla l'empty state.
3. Apri `http://localhost:5173/?scenario=error-once`.
4. Attendi l'errore, premi `Riprova` e verifica la comparsa della coda.
5. Esegui `npm run check`.

### Errori comuni

- Creare il servizio dentro il render del container. L'identità cambierebbe a ogni render.
- Trattare `AbortError` come un errore applicativo.
- Dimenticare `service` o `reloadKey` nelle dipendenze dell'Effect.
- Lasciare visibili lista ed errore nello stesso momento.

### Checkpoint

- [ ] La dashboard mostra loading, success, empty ed error.
- [ ] Il retry non ricarica la pagina.
- [ ] Ogni richiesta possiede una cleanup.
- [ ] La view non importa il servizio.
- [ ] I test attendono gli stati asincroni senza usare pause fisse.

---

## TODO 09: aggiungi la ricerca debounced

### Obiettivo

Aspetta 350 ms dopo l'ultimo carattere prima di interrogare il servizio.

### Concetto del Modulo 1

Il debounce separa il tempo dal significato della ricerca. Un custom hook gestisce timer e cleanup, mentre il hook di dominio continua a esprimere il flusso.

### Punto di partenza

Ogni carattere modifica `query` e avvia subito l'Effect di `useTickets`. Il servizio locale annulla la richiesta precedente, ma crea comunque un nuovo ciclo per ogni evento.

### File da modificare

- Crea `hooks/useDebouncedValue.ts`.
- Aggiorna `useTicketDashboard.ts`.
- Mostra nella view uno stato di ricerca quando query e valore debounced differiscono.

### Passaggi guidati

1. Conserva l'ultimo valore stabilizzato con `useState`.
2. Crea un timer dentro `useEffect`.
3. Cancella il timer nella cleanup.
4. Passa `debouncedQuery` a `useTickets`.
5. Mantieni `query` originale nell'input per non ritardare la digitazione.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri useDebouncedValue completo</summary>

`src/features/tickets/hooks/useDebouncedValue.ts`

```ts
/** Il hook restituisce il valore solo dopo una pausa della durata richiesta. */
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timerId);
  }, [delay, value]);

  return debouncedValue;
}
```

</details>

<details>
<summary>Apri useTicketDashboard finale</summary>

`src/features/tickets/hooks/useTicketDashboard.ts`

```ts
/** Il hook di dominio compone stato UI, debounce e accesso dati. */
import { useState } from 'react';
import type { TicketStatusFilter } from '../ticket.types';
import type { TicketService } from '../services/TicketService';
import { useDebouncedValue } from './useDebouncedValue';
import { useTickets } from './useTickets';

export function useTicketDashboard(service: TicketService) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<TicketStatusFilter>('tutti');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 350);
  const remote = useTickets(debouncedQuery, statusFilter, service);

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
```

</details>

Passa `isSearching` alla view e mostra un testo vicino al conteggio risultati:

```tsx
<span aria-live="polite">
  {isSearching ? 'Ricerca in corso' : `${tickets.length} risultati`}
</span>
```

### Spiegazione del codice

<details>
<summary>Apri container e view completi dopo il TODO 09</summary>

`src/features/tickets/containers/TicketDashboardContainer.tsx`

```tsx
/** Il container crea la dipendenza stabile e adatta il hook alla view. */
import { TicketDashboardView } from '../components/TicketDashboardView/TicketDashboardView';
import { useTicketDashboard } from '../hooks/useTicketDashboard';
import { createLocalTicketService } from '../services/createLocalTicketService';

const shouldFailOnce =
  new URLSearchParams(window.location.search).get('scenario') === 'error-once';
const ticketService = createLocalTicketService({ failFirstRequest: shouldFailOnce });

export function TicketDashboardContainer() {
  const dashboard = useTicketDashboard(ticketService);

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
```

`src/features/tickets/components/TicketDashboardView/TicketDashboardView.tsx`

```tsx
/** La view compone la UI usando soltanto dati, stati e callback ricevuti. */
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
      <header className="ticket-dashboard-view__topbar">
        <a href="#main-content" className="ticket-dashboard-view__brand">
          <BuildingsIcon size={20} weight="bold" aria-hidden="true" />
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
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
```

</details>


L'input usa `query`, quindi reagisce a ogni tasto. Il servizio usa `debouncedQuery`, quindi parte dopo la pausa. Quando arriva un nuovo valore, React esegue la cleanup del timer precedente prima di crearne uno nuovo.

### Perché facciamo questo passaggio

Il componente che usa la ricerca non deve conoscere timer e cancellazioni. Il custom hook rende la regola riusabile e testabile.

### Verifica

1. Aggiungi per pochi minuti `console.count('TicketService.list')` all'inizio di `list`.
2. Digita rapidamente `Verona`.
3. Controlla che la chiamata parta dopo la pausa e non per ogni lettera.
4. Rimuovi `console.count`.
5. Esegui `npm run check`.

### Errori comuni

- Usare il valore debounced come `value` dell'input.
- Omettere `delay` dalle dipendenze.
- Creare il timer durante il render.
- Conservare il contatore delle richieste nel codice consegnato.

### Checkpoint

- [ ] L'input risponde senza ritardo.
- [ ] Il servizio riceve la query stabilizzata.
- [ ] Ogni timer possiede una cleanup.
- [ ] Le richieste obsolete vengono annullate.

---

## TODO 10: chiudi confini e dipendenze

### Obiettivo

Rivedi import, prop drilling, component pairing e promozione in `shared`.

### Concetto del Modulo 1

Un'API pubblica riduce l'accoppiamento. `shared` raccoglie riuso verificato. Composition evita di trasportare markup attraverso componenti che non lo usano.

### Punto di partenza

Reset, retry e empty state usano button con la stessa struttura. La feature espone il container, ma devi controllare che nessun chiamante importi file interni.

### File da modificare

- Crea `src/shared/components/Button/Button.tsx` e il relativo Sass.
- Sostituisci i button di reset, retry e empty state.
- Riduci `features/tickets/index.ts` al contratto pubblico necessario.
- Controlla la direzione degli import.
- Compila la checklist architetturale.

### Passaggi guidati

1. Estrai `Button` dopo aver individuato almeno tre usi compatibili.
2. Mantieni `TicketDetail`, `TicketList` e `StatePanel` dentro la feature.
3. Passa sidebar e dettaglio come nodi, senza inoltrare props nel layout.
4. Esporta il container e i tipi necessari ai chiamanti.
5. Cerca deep import e dipendenze inverse.

### Codice da scrivere e stato finale dei file

<details>
<summary>Apri Button completo</summary>

`src/shared/components/Button/Button.tsx`

```tsx
/** Button standardizza aspetto e semantica, lasciando l'evento al chiamante. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function Button({
  icon,
  variant = 'primary',
  children,
  className,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={['button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      type={type}
    >
      {icon}
      {children}
    </button>
  );
}
```

`src/shared/components/Button/Button.scss`

```scss
/** Il controllo condiviso applica contrasto, focus e feedback tattile. */
@use '../../../styles/tokens' as t;

.button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: t.$space-2;
  border: 1px solid t.$color-blue-600;
  border-radius: t.$radius-control;
  padding-inline: t.$space-4;
  font-weight: 800;
  white-space: nowrap;

  &[data-variant='primary'] {
    background: t.$color-blue-600;
    color: t.$color-white;
  }

  &[data-variant='secondary'] {
    background: t.$color-white;
    color: t.$color-blue-700;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    border-color: t.$color-slate-200;
    color: t.$color-slate-500;
    cursor: not-allowed;
  }
}
```

</details>

Usa import diretti dentro i componenti della feature:

```tsx
import { Button } from '../../../../shared/components/Button/Button';
```

Mantieni l'API pubblica della feature limitata:

```ts
/** API usata dal livello app. Gli interni restano sostituibili. */
export { TicketDashboardContainer } from './containers/TicketDashboardContainer';
export type {
  Ticket,
  TicketFiltersValue,
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
export type { TicketService } from './services/TicketService';
```

I tre componenti che usano il button condiviso devono mostrare import e props
in modo esplicito. Le sezioni seguenti riportano lo stato completo dei file
modificati in questo TODO, senza righe omesse.

<details>
<summary>Apri TicketFilters.tsx finale</summary>

`src/features/tickets/components/TicketFilters/TicketFilters.tsx`

```tsx
/** TicketFilters rende controlli controllati e delega le azioni al chiamante. */
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
```

</details>

<details>
<summary>Apri StatePanel.tsx finale</summary>

`src/features/tickets/components/StatePanel/StatePanel.tsx`

```tsx
/** StatePanel presenta loading, errore ed empty state con un contratto univoco. */
import {
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Button } from '../../../../shared/components/Button/Button';
import './StatePanel.scss';

type StatePanelProps =
  | { state: 'loading' }
  | { state: 'empty'; onReset: () => void }
  | { state: 'error'; message: string; onRetry: () => void };

export function StatePanel(props: StatePanelProps) {
  if (props.state === 'loading') {
    return (
      <div className="state-panel" role="status" aria-label="Caricamento ticket">
        <div className="state-panel__skeleton" aria-hidden="true" />
        <div className="state-panel__skeleton" aria-hidden="true" />
        <span>Caricamento della coda</span>
      </div>
    );
  }

  if (props.state === 'error') {
    return (
      <div className="state-panel" role="alert">
        <WarningCircleIcon size={30} weight="duotone" aria-hidden="true" />
        <h3>Non posso caricare i ticket</h3>
        <p>{props.message}</p>
        <Button
          icon={
            <ArrowClockwiseIcon size={18} weight="bold" aria-hidden="true" />
          }
          onClick={props.onRetry}
        >
          Riprova
        </Button>
      </div>
    );
  }

  return (
    <div className="state-panel" role="status">
      <MagnifyingGlassIcon size={30} weight="duotone" aria-hidden="true" />
      <h3>Nessun ticket trovato</h3>
      <p>Modifica la ricerca oppure reimposta i filtri.</p>
      <Button onClick={props.onReset}>Mostra tutti i ticket</Button>
    </div>
  );
}
```

</details>

<details>
<summary>Apri TicketDashboardView.tsx finale</summary>

`src/features/tickets/components/TicketDashboardView/TicketDashboardView.tsx`

```tsx
/** La view compone la UI usando soltanto dati, stati e callback ricevuti. */
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
      <header className="ticket-dashboard-view__topbar">
        <a href="#main-content" className="ticket-dashboard-view__brand">
          <BuildingsIcon size={20} weight="bold" aria-hidden="true" />
          <span>
            <strong>Control Room</strong>
            <small>Operations support</small>
          </span>
        </a>
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
```

</details>

<details>
<summary>Apri container, tipi, API pubblica e App finali</summary>

`src/features/tickets/containers/TicketDashboardContainer.tsx`

```tsx
/** Il container crea la dipendenza stabile e adatta il hook alla view. */
import { TicketDashboardView } from '../components/TicketDashboardView/TicketDashboardView';
import { useTicketDashboard } from '../hooks/useTicketDashboard';
import { createLocalTicketService } from '../services/createLocalTicketService';

const shouldFailOnce =
  new URLSearchParams(window.location.search).get('scenario') === 'error-once';
const ticketService = createLocalTicketService({ failFirstRequest: shouldFailOnce });

export function TicketDashboardContainer() {
  const dashboard = useTicketDashboard(ticketService);

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
```

`src/features/tickets/ticket.types.ts`

```ts
/** I tipi definiscono il vocabolario condiviso dalla feature tickets. */
export type TicketStatus =
  | 'nuovo'
  | 'in-lavorazione'
  | 'in-attesa'
  | 'risolto';

export type TicketPriority = 'critica' | 'alta' | 'media' | 'bassa';

export type Ticket = {
  id: string;
  title: string;
  customer: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  updatedAt: string;
};

export type TicketStatusFilter = TicketStatus | 'tutti';

export type TicketFiltersValue = {
  query: string;
  status: TicketStatusFilter;
};

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
```

`src/features/tickets/index.ts`

```ts
/** L'API pubblica espone soltanto ciò che serve fuori dalla feature. */
export { TicketDashboardContainer } from './containers/TicketDashboardContainer';
export type {
  Ticket,
  TicketFiltersValue,
  TicketPriority,
  TicketStatus,
  TicketStatusFilter,
} from './ticket.types';
export type { TicketService } from './services/TicketService';
```

`src/App.tsx`

```tsx
/** App monta la feature attraverso il suo unico punto di ingresso pubblico. */
import { TicketDashboardContainer } from './features/tickets';

export function App() {
  return <TicketDashboardContainer />;
}
```

</details>

### Struttura finale

```text
src/
├── App.tsx
├── features/
│   └── tickets/
│       ├── components/
│       │   ├── StatePanel/
│       │   ├── TicketDashboardLayout/
│       │   ├── TicketDashboardView/
│       │   ├── TicketDetail/
│       │   ├── TicketFilters/
│       │   └── TicketList/
│       ├── containers/
│       │   └── TicketDashboardContainer.tsx
│       ├── hooks/
│       │   ├── useDebouncedValue.ts
│       │   ├── useTicketDashboard.ts
│       │   └── useTickets.ts
│       ├── services/
│       │   ├── createLocalTicketService.ts
│       │   └── TicketService.ts
│       ├── index.ts
│       ├── ticket.types.ts
│       └── tickets.ts
├── shared/
│   └── components/
│       └── Button/
│           ├── Button.scss
│           └── Button.tsx
└── styles/
    ├── _tokens.scss
    └── global.scss
```

### Spiegazione del codice

`Button` entra in `shared` dopo tre usi compatibili. I componenti specifici dei ticket restano nella feature. L'API pubblica espone container, tipi di dominio e contratto del servizio, senza pubblicare fixture o hook interni.

### Perché facciamo questo passaggio

Il confine pubblico riduce i percorsi che il team deve mantenere. La promozione tardiva evita astrazioni costruite su un solo caso.

### Verifica

Esegui queste ricerche dalla cartella dello starter:

```bash
rg "features/tickets/" src/App.tsx
rg "features" src/shared
rg "from '../tickets'|from '../../tickets'" src/features/tickets/components
npm run check
```

Il primo comando non deve trovare deep import. Gli altri due non devono trovare dipendenze inverse o fixture dentro i componenti.

### Errori comuni

- Spostare `TicketList` in `shared` perché potrebbe servire in futuro.
- Esportare ogni file da `index.ts`.
- Creare un barrel file in ogni cartella interna.
- Usare Context per evitare due props locali.

### Checkpoint

- [ ] `App` importa soltanto l'API pubblica.
- [ ] Gli import seguono `app -> features -> shared`.
- [ ] `shared` contiene riuso verificato.
- [ ] Ogni componente possiede codice, stile e responsabilità coerenti.
- [ ] La checklist architetturale è compilata.
- [ ] `npm run check` termina senza errori.

---

## Code review finale

Apri [la checklist architetturale](checklist-architetturale.md) e rispondi alle domande usando esempi dal tuo codice. Durante la review devi motivare:

1. perché `selectedTicket` resta derived state;
2. perché il layout riceve nodi React;
3. perché il servizio entra tramite un contratto;
4. perché `Button` vive in `shared` e `TicketList` resta nella feature.

## Estensione facoltativa

Scrivi un test per `useDebouncedValue` con fake timer. Verifica che il valore resti invariato prima di 350 ms e cambi dopo l'avanzamento del timer. Questa estensione prepara il lavoro sui test del Modulo 5 senza cambiare l'architettura raggiunta.
