# Operations Dashboard, soluzione del Modulo 1

Questa cartella contiene il risultato dei 10 TODO del laboratorio. Il progetto
è autonomo: usa dati locali, non richiede account, backend o file `.env`.

Consulta questa soluzione dopo aver completato un TODO e aver eseguito
`npm run check` nello starter. Il confronto serve a leggere responsabilità,
flusso dei dati e direzione delle dipendenze.

## Requisiti

- Node.js 22.13 o successivo. `.nvmrc` indica Node 24.12.
- npm 10 o successivo.

## Primo avvio

Esegui i comandi dalla radice della repository:

```bash
cd progetto/soluzione/operations-dashboard
nvm use
npm ci
npm run dev
```

Vite stampa l'indirizzo locale da aprire nel browser.

## Scenari disponibili

La dashboard parte con 12 ticket e una latenza locale di 450 ms.

- Percorso standard: apri l'indirizzo stampato da Vite.
- Errore e retry: aggiungi `?scenario=error-once` all'indirizzo.
- Empty state: cerca una frase che non compare nei ticket.
- Debounce: digita una query rapida e osserva `Ricerca in corso`.

Nello scenario `error-once` il servizio rifiuta la prima richiesta. Il button
`Riprova` esegue una nuova chiamata senza ricaricare la pagina.

## Comandi

| Comando | Uso |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo. |
| `npm run test` | Esegue tutti i test una volta. |
| `npm run test:watch` | Riesegue i test dopo ogni modifica. |
| `npm run lint` | Controlla regole statiche e uso degli Hook. |
| `npm run build` | Controlla i tipi e crea la build di produzione. |
| `npm run preview` | Serve la build di produzione in locale. |
| `npm run check` | Esegue lint, test e build in sequenza. |

## Struttura

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
└── styles/
    ├── _tokens.scss
    └── global.scss
```

## Flusso dei dati

```text
App
  -> TicketDashboardContainer
      -> createLocalTicketService
      -> useTicketDashboard
          -> useDebouncedValue
          -> useTickets
              -> TicketService.list(filters, signal)
      -> TicketDashboardView
          -> layout, filtri, lista, dettaglio e stati applicativi
```

Il flusso scende tramite props. Le azioni risalgono tramite callback. La view
non importa servizi o fixture e i componenti presentazionali non modificano lo
stato posseduto dal custom hook.

## Responsabilità dei blocchi

### API pubblica

`features/tickets/index.ts` espone il container, i tipi di dominio e il
contratto del servizio. `App.tsx` non usa percorsi interni alla feature.

Gli import interni restano diretti. Questa scelta evita barrel file annidati e
riduce il rischio di dipendenze circolari.

### Container

`TicketDashboardContainer` usa l'implementazione locale di `TicketService` e
chiama `useTicketDashboard`. Il servizio predefinito vive fuori dal render,
quindi la sua identità resta stabile e l'Effect non riparte per un nuovo oggetto
a ogni render. Nei test il container può ricevere un servizio dedicato. Questa
piccola dependency injection permette di verificare errore e retry dalla UI.

### Custom hook di dominio

`useTicketDashboard` possiede tre valori scelti dall'utente:

- query di ricerca;
- filtro per stato;
- id del ticket selezionato.

Il ticket selezionato, i conteggi e `isSearching` sono valori derivati. Il hook
li calcola durante il render invece di conservarne una seconda copia nello
stato.

### Accesso ai dati

`TicketService` dichiara il metodo richiesto dalla feature:

```ts
list(filters, signal): Promise<Ticket[]>
```

`createLocalTicketService` implementa il contratto usando fixture e un timer.
L'implementazione applica ricerca e filtro, simula un errore singolo e rispetta
`AbortSignal`.

`useTickets` gestisce il ciclo asincrono:

1. crea un `AbortController`;
2. imposta lo stato `loading`;
3. chiama il servizio;
4. pubblica `success` oppure `error`;
5. annulla la richiesta nella cleanup dell'Effect.

Il hook ignora `AbortError` perché una richiesta annullata è stata sostituita
da una richiesta più recente.

### Debounce

L'input usa `query`, quindi mostra ogni carattere. Il servizio usa
`debouncedQuery`, aggiornato 350 ms dopo l'ultima modifica. La cleanup cancella
il timer precedente e impedisce chiamate intermedie.

### View e componenti presentazionali

`TicketDashboardView` riceve dati, stato asincrono e callback. Compone:

- `TicketDashboardLayout` per le aree sidebar, lista e dettaglio;
- `TicketFilters` per i controlli controllati;
- `TicketList` e `TicketListItem` per la selezione;
- `TicketDetail` per il ticket derivato;
- `StatePanel` per loading, error ed empty state.

`TicketList` usa `ticket.id` come key. Ogni riga usa un button con
`aria-pressed`, quindi tastiera e tecnologie assistive ricevono la semantica di
selezione.

### Codice condiviso

`shared/components/Button` contiene il solo elemento promosso fuori dalla
feature. Reset, retry ed empty state condividono struttura e comportamento.
Lista, dettaglio e filtri restano nel dominio tickets.

### Sass

`styles/_tokens.scss` definisce palette, spazi, raggi e ombre. Ogni componente
visuale usa il proprio namespace Sass. Il layout passa a una colonna sotto
768 px e mantiene il dettaglio su una riga separata nella fascia intermedia.

## Accessibilità

- Input e select hanno label visibili.
- Link, input, select e button mostrano il focus.
- La lista usa button nativi e `aria-pressed`.
- Loading ed empty state usano `role="status"`.
- L'errore usa `role="alert"`.
- Le icone decorative hanno `aria-hidden="true"`.
- Il layout non produce overflow a 390, 768 e 1440 px.

## Test

I test coprono:

- rendering e caricamento iniziale;
- ricerca, filtro, reset e selezione;
- empty state;
- debounce e cleanup del timer;
- errore singolo, retry del servizio e abort.

I test interrogano ruoli, label e testo visibile. Non dipendono dalla struttura
interna dei componenti.

## Differenze rispetto allo starter

Lo starter concentra stato, calcoli e markup in `OperationsDashboard.tsx`.
La soluzione divide il lavoro tra feature, componenti presentazionali,
container, hook, servizio e codice condiviso. Il comportamento iniziale resta
riconoscibile, mentre loading, retry, dettaglio e debounce completano il flusso.

Per ripercorrere le modifiche nell'ordine didattico usa il
[brief del laboratorio](../../documentazione/brief-modulo-1.md).
