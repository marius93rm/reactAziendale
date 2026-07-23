# Lezione guidata Modulo 2: progettare una Widget Dashboard

## Obiettivo della lezione

Parti da una dashboard Material UI funzionante e distribuisci lo stato secondo responsabilità esplicite. Alla fine della lezione avrai stato locale, globale, derivato, persistente e server state con proprietari distinti.

Il brief indica il file da aprire, il codice da estrarre e il confine da ottenere.

La soluzione usa `useReducer`, Context separati e chiamate API gestite da `useEffect`. Il flusso asincrono comprende abort, loading, error, empty state, retry, cache, refresh, invalidazione, optimistic update e rollback.

## Risultato del Modulo 2

Il laboratorio produce la mappa decisionale richiesta dal programma. Ogni decisione deve citare un valore reale della dashboard.

## Cosa stai costruendo

All'avvio la dashboard mostra dati delle sedi e quattro widget configurabili. Il file `OperationsDashboard.tsx` contiene tutto: ricerca, intervallo, widget, Dialog, `localStorage`, richiesta API e rendering.

Alla fine il codice avrà questi proprietari. Leggi questa tabella prima di aprire lo starter. Rappresenta la destinazione del lavoro, non una lista di stati da creare tutti insieme.

| Valore | Proprietario finale | Motivo |
| --- | --- | --- |
| Ricerca, Dialog aperto e conferma eliminazione | `DashboardPage` | Li usa soltanto la pagina che li rende. |
| Draft del form | `WidgetEditorDialog` | Esiste mentre il Dialog è montato. Annulla lo scarta. |
| Intervallo, layout, operazioni pending e Snackbar | `DashboardProvider` | Più componenti leggono o modificano questi valori. |
| Sedi, alert, loading, errore e refresh | `useOperationsData` | Dipendono dalla API e dal ciclo della richiesta. |
| Widget visibili, totale consumi e occupazione media | Componenti che li mostrano | Si calcolano da dati già disponibili. |
| Cache | Servizio API | Dipende dalla query e non dal rendering. |

## Ordine della lezione

1. Classifica lo stato e separa ciò che puoi calcolare.
2. Sposta il draft nel Dialog e rendi il form indipendente.
3. Descrivi le transizioni del layout con un reducer puro.
4. Distribuisci stato, azioni e servizio con Context distinti.
5. Salva soltanto la configurazione confermata nel browser.
6. Estrai il contratto API e il custom hook della richiesta.
7. Rendi visibili tutti gli stati asincroni.
8. Aggiungi cache, refresh e invalidazione.
9. Salva i widget in modo ottimistico e gestisci il rollback.
10. Verifica i confini e completa la mappa decisionale.

Non creare i file della soluzione in anticipo. Dopo ogni TODO esegui il comando di verifica indicato.

## Prerequisiti

- Node.js 22.13 o successivo. Il progetto include `.nvmrc` per Node 24.12.
- npm 10 o successivo.
- `nvm` è facoltativo. Puoi usare anche fnm, Volta o un'installazione diretta.
- Conoscenza di componenti funzionali, props, `useState` e `useEffect`.
- Conoscenza di Promise, `async/await` e `AbortController`.

## Avvio

Esegui i comandi dalla radice della repository:

```bash
cd progetto2/starter/widget-dashboard
nvm use
npm ci
npm run dev
```

Se non usi `nvm`, salta `nvm use`. Controlla le versioni con `node --version` e `npm --version` prima di eseguire `npm ci`.

Apri l'indirizzo stampato da Vite. Prova queste azioni:

1. Cerca `consumi` e reimposta la ricerca.
2. Cambia intervallo.
3. Crea un widget `Presidio serale`.
4. Modifica dimensione e titolo.
5. Sposta il widget prima e dopo.
6. Elimina il widget e conferma l'azione.
7. Ricarica la pagina e controlla la configurazione salvata.

Chiudi il controllo iniziale con:

```bash
npm run check
```

## Scenari della API

La API simulata non usa rete esterna. La query string controlla casi ripetibili:

| Indirizzo | Comportamento |
| --- | --- |
| `/?scenario=error-once` | La prima lettura fallisce. Il retry riesce. |
| `/?scenario=empty` | La lettura restituisce zero sedi. |
| `/?scenario=save-error-once` | Il primo salvataggio widget fallisce. |

Nella soluzione puoi anche inserire `rollback` nel titolo. Il servizio rifiuta la modifica e il reducer ripristina il widget precedente.

## Struttura iniziale

```text
src/
├── App.tsx
├── main.tsx
├── theme.ts
├── dashboard/
│   ├── OperationsDashboard.tsx
│   ├── OperationsDashboard.test.tsx
│   ├── dashboard.types.ts
│   └── operationsApi.ts
└── test/
    └── setup.ts
```

`OperationsDashboard.tsx` contiene configurazione widget, filtri, richiesta API, persistenza, Dialog e rendering. Il comportamento è corretto. Il file rende costoso capire quale stato appartiene a quale responsabilità.

## Lettura guidata dello starter

Apri `src/dashboard/OperationsDashboard.tsx` e cerca questi punti nell'ordine. Non modificarli ancora.

1. `useState` per `query`, `range`, `widgets`, `draft`, `dialogOpen`, stato richiesta e retry.
2. `readInitialWidgets`, che legge il layout dal browser.
3. L'`useEffect` che chiama `loadSnapshot` quando cambia l'intervallo.
4. I calcoli `visibleWidgets`, totale dei consumi e occupazione media.
5. Gli handler che creano, aggiornano, spostano o eliminano un widget.

Scrivi nella mappa almeno `query`, `range`, `widgets`, `draft`, `snapshot` e `visibleWidgets`. Per ciascuno indica chi lo legge, chi lo modifica e se deve sopravvivere al reload. Questa lettura evita di scegliere `Context` o `useReducer` per abitudine.

## Metodo di lavoro

Per ogni TODO:

1. leggi obiettivo e concetto;
2. compila la riga corrispondente nella mappa;
3. modifica i file indicati;
4. prova comportamento standard e caso di errore;
5. esegui `npm run check`.

Non proseguire con test rossi, warning React o errori TypeScript. Confronta il tuo risultato con `progetto2/soluzione/widget-dashboard` dopo il tentativo.

---

## TODO 01: classifica ogni stato

### Obiettivo

Costruisci l'inventario prima di spostare codice. Rimuovi le copie derivabili.

### Concetto del Modulo 2

La categoria dipende dalla sorgente e dal ciclo di vita del valore. Il numero di componenti che lo leggono non basta.

### Punto di partenza

Lo starter usa più `useState` nello stesso componente. Alcuni valori rappresentano eventi utente. Altri arrivano dalla API o si calcolano da valori disponibili.

### Prima di scrivere codice

- `query` nasce quando digiti nella pagina. È stato locale.
- `range` cambia la richiesta e deve restare dopo il reload. È stato condiviso e persistente.
- `widgets` descrive il layout che più componenti modificano. È stato condiviso e persistente.
- `draft` serve al solo form aperto. È stato locale del Dialog.
- `snapshot` arriva dalla API. È server state.
- `visibleWidgets` dipende da `query` e `widgets`. È derived state e non richiede `useState`.

Non spostare ancora nessuno stato. In questo TODO decidi i proprietari e annotali nella mappa.

### File da esaminare

- `src/dashboard/OperationsDashboard.tsx`
- `src/dashboard/dashboard.types.ts`
- `../../documentazione/mappa-decisionale-stato-studente.md`

### Passaggi guidati

1. Apri `OperationsDashboard.tsx` e individua il blocco di `useState` dentro `OperationsDashboard`.
2. Copia nella mappa i nomi `widgets`, `range`, `query`, `snapshot`, `loadStatus`, `error`, `retryToken`, `dialogOpen`, `draft` e `widgetToDelete`.
3. Per ogni valore, cerca dove viene letto. Per esempio, `range` alimenta la `Select` e la chiamata `loadSnapshot`; `query` alimenta il filtro dei widget.
4. Cerca poi i relativi setter. Un valore modificato da un solo componente può restare locale. Un valore modificato da più parti della feature richiede un proprietario condiviso.
5. Indica la sorgente del valore. `snapshot` arriva dalla API, `draft` nasce dal form, `visibleWidgets` nasce da un calcolo.
6. Indica la durata. `draft` termina alla chiusura del Dialog; `widgets` e `range` devono sopravvivere al reload.
7. Compila la colonna `Categoria` della mappa usando locale, condiviso, persistente, server o derived.
8. Controlla `visibleWidgets`, il totale dei consumi e l'occupazione media. Devono restare normali costanti calcolate durante il render, senza setter.

### Cosa devi capire prima di proseguire

`useState` indica che un valore cambia, ma non stabilisce a chi appartiene. La scelta del proprietario dipende da sorgente, durata e componenti coinvolti. In questo progetto `snapshot` e `widgets` sono entrambi letti dalla dashboard, ma hanno cicli di vita diversi: il primo arriva dal servizio, il secondo descrive una configurazione dell'utente.

### Risultato del TODO

Non hai ancora cambiato l'interfaccia. Hai una mappa compilata che userai nei TODO successivi per decidere cosa spostare nel Dialog, nel provider, nel custom hook e nel servizio.

### Codice da scrivere e stato finale del documento

In questo TODO compili un documento, non modifichi i componenti. Usa la tabella come controllo dopo aver provato a classificare i valori.

<details>
<summary>Apri un esempio completo della mappa compilata</summary>

`../../documentazione/mappa-decisionale-stato-studente.md`

```md
| Valore | Sorgente | Chi legge | Chi modifica | Sopravvive al reload | Categoria | Proprietario |
| --- | --- | --- | --- | --- | --- | --- |
| query | Input di ricerca | OperationsDashboard | OperationsDashboard | No | UI state locale | OperationsDashboard |
| range | Select intervallo | Pagina e useOperationsData | Azione setRange | Sì | Stato condiviso persistente | DashboardProvider |
| widgets | Layout iniziale o storage | Pagina e card | Azioni layout | Sì | Stato condiviso persistente | DashboardProvider |
| draft | Widget iniziale e campi form | WidgetEditorDialog | WidgetEditorDialog | No | Stato locale | WidgetEditorDialog |
| snapshot | OperationsApi | Pagina e WidgetContent | useOperationsData | No | Server state | useOperationsData |
| stato richiesta | Ciclo della Promise | Pagina | useOperationsData | No | Server state | useOperationsData |
| visibleWidgets | widgets e query | Pagina | Nessuno | No | Derived state | Calcolo nel render |
| totale consumi | snapshot.sites | WidgetContent | Nessuno | No | Derived state | Calcolo nel render |
| cache | Risposte OperationsApi | OperationsApi | OperationsApi | No | Server state infrastrutturale | createSimulatedOperationsApi |
| pendingWidgetIds | Mutazioni widget | Pagina e card | dashboardReducer | No | Stato di mutazione condiviso | DashboardProvider |
```

</details>

La colonna `Proprietario` anticipa i nomi finali. Nel codice dello starter alcuni valori vivono ancora in `OperationsDashboard`; i TODO successivi li spostano nel proprietario indicato.

### Codice chiave

```tsx
const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');

const visibleWidgets = widgets.filter((widget) =>
  [widget.title, widget.kind]
    .join(' ')
    .toLocaleLowerCase('it-IT')
    .includes(normalizedQuery),
);
```

### Spiegazione

`visibleWidgets` dipende da `widgets` e `query`. React lo ricalcola durante il render. Uno stato separato richiederebbe sincronizzazione e potrebbe diventare obsoleto.

### Verifica

```bash
rg "setVisible|setTotal|setAverage" src
```

La ricerca non deve trovare setter per valori derivati.

### Errori comuni

- Copiare un filtro dentro uno stato tramite Effect.
- Chiamare globale ogni valore usato dalla pagina.
- Salvare dati API in `localStorage` perché più componenti li leggono.

### Checkpoint

- [ ] Ogni valore ha una categoria e un proprietario.
- [ ] Derived state non possiede setter.
- [ ] La ricerca continua a funzionare.
- [ ] `npm run check` termina senza errori.

---

## TODO 02: mantieni il draft nel Dialog

### Obiettivo

Estrai `WidgetEditorDialog` e assegna il draft al componente che rende il form.

### Concetto del Modulo 2

Lo stato locale riduce accoppiamento. Un valore temporaneo non entra in Context se nessun ramo distante lo usa.

### Punto di partenza

Lo starter conserva `dialogOpen` e `draft` nella dashboard. Ogni pressione di tasto renderizza il componente che ospita tutti i widget.

### Trasformazione da eseguire

In questo punto il componente contenitore si chiama ancora `OperationsDashboard`. Deve mantenere solo la scelta di aprire il form e, quando modifichi un widget, quale widget passare al form. `WidgetEditorDialog` deve mantenere il testo inserito nei campi. Rinominerai il contenitore in `DashboardPage` nel TODO 10.

Usa un tipo locale nella pagina per distinguere creazione e modifica:

```ts
type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; widget: DashboardWidget }
  | null;
```

Quando `editor` vale `null`, non rendere `WidgetEditorDialog`. Quando l'utente annulla o salva, imposta `editor` a `null`. Il nuovo montaggio inizializza un nuovo draft senza Effect di sincronizzazione.

### File da creare

- `src/dashboard/components/WidgetEditorDialog.tsx`

### Passaggi guidati

1. Crea la cartella `src/dashboard/components` e il file `WidgetEditorDialog.tsx`.
2. Sposta dal file iniziale il markup del Dialog di creazione e modifica. Porta con te i campi titolo, tipologia e dimensione, ma lascia nella pagina il Dialog di conferma eliminazione.
3. Definisci le props `widget`, `onClose` e `onSave`. Usa una prop facoltativa `widget?: DashboardWidget`: `undefined` indica una creazione, un oggetto indica una modifica.
4. Copia `createDraft` nel nuovo file oppure costruisci il valore iniziale nella funzione passata a `useState`.
5. Trasforma gli input in controlli del draft locale. Ogni `onChange` deve chiamare `setDraft` e modificare soltanto la proprietà interessata.
6. Inserisci il contenuto del Dialog in un `form`. Nel submit esegui `event.preventDefault()`, rimuovi gli spazi dal titolo e chiama `onSave` soltanto con un titolo valido.
7. In `OperationsDashboard`, sostituisci `dialogOpen` e `draft` con `editor`. Il pulsante `Crea widget` usa `setEditor({ mode: 'create' })`; il pulsante di modifica usa `setEditor({ mode: 'edit', widget })`.
8. Rendi `WidgetEditorDialog` solo quando `editor` contiene un valore. Passa `undefined` in creazione e `editor.widget` in modifica.
9. In `onClose` imposta `editor` a `null`. In `onSave` chiudi il Dialog e inoltra il widget all'azione di salvataggio.

### Cosa cambia nel flusso

Prima la pagina prepara e aggiorna il draft. Dopo l'estrazione la pagina decide soltanto quale Dialog aprire. Il Dialog possiede i caratteri digitati e restituisce un widget completo al submit.

```text
click Crea o Modifica
  -> OperationsDashboard sceglie il widget
  -> WidgetEditorDialog crea il draft locale
  -> l'utente modifica i campi
  -> submit invia il draft
  -> OperationsDashboard chiude il Dialog
```

### Risultato del TODO

`OperationsDashboard.tsx` non contiene più lo stato dei campi del form. Annullare smonta il Dialog e scarta il draft. Riaprirlo crea un nuovo valore iniziale.

### Codice da scrivere e stato finale dei file

Crea il file seguente. Dopo averlo scritto, rimuovi da `OperationsDashboard.tsx` gli import MUI usati soltanto dal form e sostituisci il vecchio Dialog con `WidgetEditorDialog`.

<details>
<summary>Apri WidgetEditorDialog.tsx completo</summary>

`src/dashboard/components/WidgetEditorDialog.tsx`

```tsx
/** Il draft del form resta locale e scompare quando il Dialog viene smontato. */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type {
  DashboardWidget,
  WidgetKind,
  WidgetSize,
} from '../dashboard.types';

const kindLabels: Record<WidgetKind, string> = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

type WidgetEditorDialogProps = {
  widget?: DashboardWidget;
  onClose: () => void;
  onSave: (widget: DashboardWidget) => void;
};

export function WidgetEditorDialog({
  widget,
  onClose,
  onSave,
}: WidgetEditorDialogProps) {
  const [draft, setDraft] = useState<DashboardWidget>(() =>
    widget
      ? { ...widget }
      : { id: '', title: '', kind: 'alerts', size: 'compact' },
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.title.trim()) {
            onSave({ ...draft, title: draft.title.trim() });
          }
        }}
      >
        <DialogTitle>{widget ? 'Modifica widget' : 'Crea widget'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Titolo"
              slotProps={{ htmlInput: { 'aria-label': 'Titolo' } }}
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              helperText="Per provare il rollback, inserisci la parola rollback."
            />
            <FormControl>
              <InputLabel id="widget-kind-label">Tipo di widget</InputLabel>
              <Select
                labelId="widget-kind-label"
                label="Tipo di widget"
                value={draft.kind}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    kind: event.target.value as WidgetKind,
                  }))
                }
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="widget-size-label">Dimensione</InputLabel>
              <Select
                labelId="widget-size-label"
                label="Dimensione"
                value={draft.size}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    size: event.target.value as WidgetSize,
                  }))
                }
              >
                <MenuItem value="compact">Compatto</MenuItem>
                <MenuItem value="wide">Esteso</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annulla</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!draft.title.trim()}
          >
            Salva widget
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
```

</details>

Nel contenitore aggiungi l'import e usa questo blocco al posto del Dialog precedente:

```tsx
import { WidgetEditorDialog } from './components/WidgetEditorDialog';

{editor ? (
  <WidgetEditorDialog
    widget={editor.mode === 'edit' ? editor.widget : undefined}
    onClose={() => setEditor(null)}
    onSave={(widget) => {
      setEditor(null);
      saveWidget(widget);
    }}
  />
) : null}
```

In questo checkpoint `saveWidget` può ancora essere la funzione locale dello starter. Modificala perché riceva il widget come argomento:

```tsx
function saveWidget(draft: DashboardWidget) {
  const title = draft.title.trim();
  if (!title) return;

  setWidgets((current) =>
    draft.id
      ? current.map((widget) =>
          widget.id === draft.id ? { ...draft, title } : widget,
        )
      : [
          ...current,
          {
            ...draft,
            id: `widget-${crypto.randomUUID()}`,
            title,
          },
        ],
  );
}
```

### Codice chiave

```tsx
const [draft, setDraft] = useState<DashboardWidget>(() =>
  widget
    ? { ...widget }
    : { id: '', title: '', kind: 'alerts', size: 'compact' },
);
```

### Perché funziona

La dashboard smonta il Dialog alla chiusura. Il montaggio successivo crea un nuovo draft. Annulla scarta le modifiche senza sincronizzazione.

### Verifica manuale

1. Apri un widget.
2. Cambia titolo.
3. Premi `Annulla`.
4. Riapri lo stesso widget.

Il titolo originale deve essere presente.

### Errori comuni

- Inserire il draft nel Context.
- Aggiornare il widget globale a ogni tasto.
- Usare `useEffect(() => setDraft(widget), [widget])`.

### Checkpoint

- [ ] Il draft vive nel Dialog.
- [ ] Annulla non modifica la dashboard.
- [ ] Click e Invio eseguono lo stesso submit.
- [ ] Label e focus restano gestiti da MUI.
- [ ] I test usano ruoli e nomi accessibili.

---

## TODO 03: modella il layout con `useReducer`

### Obiettivo

Sostituisci gli aggiornamenti dispersi di `widgets` e `range` con transizioni nominate.

### Concetto del Modulo 2

`useReducer` aiuta quando le transizioni coinvolgono array, pending, messaggi e rollback. Il reducer resta puro.

### Stato che il reducer possiede

Sposta in `DashboardState` solo configurazione e feedback della relativa mutazione. Il server state resta fuori dal reducer.

```ts
type DashboardState = {
  widgets: DashboardWidget[];
  range: TimeRange;
  pendingWidgetIds: string[];
  notice: { severity: 'success' | 'error'; message: string } | null;
};
```

Leggi ogni azione come una frase al passato: `rangeChanged`, `widgetChangeStarted`, `widgetChangeCommitted`. Evita azioni come `setWidgets`, perché non spiegano perché il layout cambia.

### File da creare

- `src/dashboard/state/dashboardReducer.ts`
- `src/dashboard/state/dashboardReducer.test.ts`

### Azioni richieste

```ts
type DashboardAction =
  | { type: 'rangeChanged'; range: TimeRange }
  | {
      type: 'widgetChangeStarted';
      next: DashboardWidget;
      previous: DashboardWidget | null;
    }
  | {
      type: 'widgetChangeCommitted';
      optimisticId: string;
      widget: DashboardWidget;
    }
  | {
      type: 'widgetChangeRolledBack';
      widgetId: string;
      previous: DashboardWidget | null;
      message: string;
    }
  | { type: 'widgetRemoved'; widgetId: string }
  | { type: 'widgetMoved'; widgetId: string; direction: -1 | 1 }
  | { type: 'layoutReset' }
  | { type: 'noticeCleared' };
```

### Passaggi guidati

1. Aggiungi `DashboardState` a `src/dashboard/dashboard.types.ts`. Inserisci `widgets`, `range`, `pendingWidgetIds` e `notice`.
2. Crea `src/dashboard/state/dashboardReducer.ts` ed esporta il tipo `DashboardAction`.
3. Implementa prima le azioni sincrone: `rangeChanged`, `widgetRemoved`, `widgetMoved`, `layoutReset` e `noticeCleared`.
4. In `widgetMoved`, trova l'indice corrente, calcola la destinazione e restituisci `state` se la destinazione esce dall'array. Negli altri casi copia l'array prima di usare `splice`.
5. Implementa `widgetChangeStarted`. Se l'id esiste, sostituisci quel widget; se non esiste, aggiungilo. Aggiungi poi l'id a `pendingWidgetIds`.
6. Implementa `widgetChangeCommitted`. Sostituisci il widget ottimistico con quello restituito dalla API, rimuovi il suo id dai pending e prepara una notifica di successo.
7. Implementa `widgetChangeRolledBack`. Se `previous` contiene un widget, ripristinalo; se vale `null`, rimuovi la nuova creazione. Rimuovi l'id dai pending e prepara la notifica di errore.
8. Prima di commit o rollback, controlla che l'id sia ancora pending. Una risposta tardiva dopo il reset non deve modificare il layout.
9. Aggiungi il controllo esaustivo `never` nel ramo finale del reducer.
10. Scrivi i test partendo dalle transizioni, senza renderizzare React: cambio intervallo, spostamento, commit, rollback e risposta tardiva.

### Come leggere una transizione

Il reducer riceve lo stato prima dell'evento e restituisce lo stato dopo l'evento. Non conosce il pulsante che ha generato l'azione e non conosce la API. Questo limite rende le transizioni ripetibili nei test.

```text
DashboardState precedente + DashboardAction
  -> dashboardReducer
  -> DashboardState successivo
```

### Risultato del TODO

La logica che modifica l'array dei widget vive in una funzione pura. Nel TODO 04 collegherai questa funzione al provider e rimuoverai dalla pagina le copie di `map`, `filter` e riordino presenti negli handler.

### Codice da scrivere e stato finale dei file

Il file dei tipi mostra anche `OperationsLoadState`, che userai dal TODO 06. Puoi aggiungerlo ora: è una dichiarazione senza comportamento e non modifica il checkpoint.

<details>
<summary>Apri dashboard.types.ts completo</summary>

`src/dashboard/dashboard.types.ts`

```ts
/** I tipi distinguono configurazione client, dati server e stato delle richieste. */
export type TimeRange = 'oggi' | '7-giorni' | '30-giorni';

export type SiteHealth = 'regolare' | 'attenzione' | 'critica';

export type Site = {
  id: string;
  name: string;
  city: string;
  health: SiteHealth;
  energyKwh: number;
  occupancy: number;
};

export type OperationsAlert = {
  id: string;
  siteId: string;
  title: string;
  severity: 'media' | 'alta';
};

export type OperationsSnapshot = {
  sites: Site[];
  alerts: OperationsAlert[];
  updatedAt: string;
};

export type WidgetKind = 'alerts' | 'sites' | 'energy' | 'occupancy';
export type WidgetSize = 'compact' | 'wide';

export type DashboardWidget = {
  id: string;
  title: string;
  kind: WidgetKind;
  size: WidgetSize;
};

export type DashboardState = {
  widgets: DashboardWidget[];
  range: TimeRange;
  pendingWidgetIds: string[];
  notice: { severity: 'success' | 'error'; message: string } | null;
};

export type OperationsLoadState = {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  data: OperationsSnapshot | null;
  error: string | null;
  isRefreshing: boolean;
};
```

</details>

<details>
<summary>Apri dashboardReducer.ts completo</summary>

`src/dashboard/state/dashboardReducer.ts`

```ts
/** Il reducer descrive transizioni pure e mantiene il rollback esplicito. */
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';
import { initialWidgets } from './dashboardStorage';

export type DashboardAction =
  | { type: 'rangeChanged'; range: TimeRange }
  | {
      type: 'widgetChangeStarted';
      next: DashboardWidget;
      previous: DashboardWidget | null;
    }
  | {
      type: 'widgetChangeCommitted';
      optimisticId: string;
      widget: DashboardWidget;
    }
  | {
      type: 'widgetChangeRolledBack';
      widgetId: string;
      previous: DashboardWidget | null;
      message: string;
    }
  | { type: 'widgetRemoved'; widgetId: string }
  | { type: 'widgetMoved'; widgetId: string; direction: -1 | 1 }
  | { type: 'layoutReset' }
  | { type: 'noticeCleared' };

function withoutPending(state: DashboardState, widgetId: string) {
  return state.pendingWidgetIds.filter((id) => id !== widgetId);
}

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'rangeChanged':
      return { ...state, range: action.range };

    case 'widgetChangeStarted': {
      const exists = state.widgets.some((widget) => widget.id === action.next.id);
      return {
        ...state,
        widgets: exists
          ? state.widgets.map((widget) =>
              widget.id === action.next.id ? action.next : widget,
            )
          : [...state.widgets, action.next],
        pendingWidgetIds: state.pendingWidgetIds.includes(action.next.id)
          ? state.pendingWidgetIds
          : [...state.pendingWidgetIds, action.next.id],
        notice: null,
      };
    }

    case 'widgetChangeCommitted':
      if (!state.pendingWidgetIds.includes(action.optimisticId)) return state;
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.optimisticId ? action.widget : widget,
        ),
        pendingWidgetIds: withoutPending(state, action.optimisticId),
        notice: { severity: 'success', message: 'Widget salvato.' },
      };

    case 'widgetChangeRolledBack':
      if (!state.pendingWidgetIds.includes(action.widgetId)) return state;
      return {
        ...state,
        widgets: action.previous
          ? state.widgets.map((widget) =>
              widget.id === action.widgetId ? action.previous! : widget,
            )
          : state.widgets.filter((widget) => widget.id !== action.widgetId),
        pendingWidgetIds: withoutPending(state, action.widgetId),
        notice: { severity: 'error', message: action.message },
      };

    case 'widgetRemoved':
      return {
        ...state,
        widgets: state.widgets.filter((widget) => widget.id !== action.widgetId),
      };

    case 'widgetMoved': {
      const from = state.widgets.findIndex((widget) => widget.id === action.widgetId);
      const to = from + action.direction;
      if (from < 0 || to < 0 || to >= state.widgets.length) return state;
      const widgets = [...state.widgets];
      const [moved] = widgets.splice(from, 1);
      widgets.splice(to, 0, moved);
      return { ...state, widgets };
    }

    case 'layoutReset':
      return {
        ...state,
        widgets: initialWidgets.map((widget) => ({ ...widget })),
        range: 'oggi',
        pendingWidgetIds: [],
        notice: { severity: 'success', message: 'Layout ripristinato.' },
      };

    case 'noticeCleared':
      return { ...state, notice: null };

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
```

</details>

<details>
<summary>Apri dashboardReducer.test.ts completo</summary>

`src/dashboard/state/dashboardReducer.test.ts`

```ts
/** I test osservano transizioni di dominio e rollback senza renderizzare React. */
import type { DashboardState, DashboardWidget } from '../dashboard.types';
import { dashboardReducer } from './dashboardReducer';

const widget: DashboardWidget = {
  id: 'widget-test',
  title: 'Widget test',
  kind: 'alerts',
  size: 'compact',
};

const state: DashboardState = {
  widgets: [widget],
  range: 'oggi',
  pendingWidgetIds: [],
  notice: null,
};

describe('dashboardReducer', () => {
  it('aggiorna un widget in modo ottimistico e conferma il salvataggio', () => {
    const next = { ...widget, title: 'Titolo aggiornato' };
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next,
      previous: widget,
    });

    expect(pending.widgets[0].title).toBe('Titolo aggiornato');
    expect(pending.pendingWidgetIds).toEqual(['widget-test']);

    const committed = dashboardReducer(pending, {
      type: 'widgetChangeCommitted',
      optimisticId: widget.id,
      widget: next,
    });
    expect(committed.pendingWidgetIds).toEqual([]);
    expect(committed.notice?.severity).toBe('success');
  });

  it('ripristina la versione precedente quando il salvataggio fallisce', () => {
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: { ...widget, title: 'Rollback richiesto' },
      previous: widget,
    });
    const rolledBack = dashboardReducer(pending, {
      type: 'widgetChangeRolledBack',
      widgetId: widget.id,
      previous: widget,
      message: 'Salvataggio rifiutato.',
    });

    expect(rolledBack.widgets[0]).toEqual(widget);
    expect(rolledBack.pendingWidgetIds).toEqual([]);
    expect(rolledBack.notice).toEqual({
      severity: 'error',
      message: 'Salvataggio rifiutato.',
    });
  });

  it('riordina senza mutare lo stato sorgente', () => {
    const second = { ...widget, id: 'widget-second', title: 'Secondo' };
    const source = { ...state, widgets: [widget, second] };
    const moved = dashboardReducer(source, {
      type: 'widgetMoved',
      widgetId: second.id,
      direction: -1,
    });

    expect(moved.widgets.map((item) => item.id)).toEqual([
      'widget-second',
      'widget-test',
    ]);
    expect(source.widgets.map((item) => item.id)).toEqual([
      'widget-test',
      'widget-second',
    ]);
  });

  it('ignora un rollback arrivato dopo il reset del layout', () => {
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: { ...widget, title: 'Titolo temporaneo' },
      previous: widget,
    });
    const reset = dashboardReducer(pending, { type: 'layoutReset' });
    const lateRollback = dashboardReducer(reset, {
      type: 'widgetChangeRolledBack',
      widgetId: widget.id,
      previous: { ...widget, title: 'Titolo precedente al reset' },
      message: 'Errore tardivo',
    });

    expect(lateRollback).toBe(reset);
    expect(lateRollback.widgets[0].title).toBe('Criticità aperte');
  });

  it('applica un id canonico restituito dalla API', () => {
    const optimistic = { ...widget, id: 'widget-temporaneo' };
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: optimistic,
      previous: null,
    });
    const canonical = { ...optimistic, id: 'widget-canonico' };
    const committed = dashboardReducer(pending, {
      type: 'widgetChangeCommitted',
      optimisticId: optimistic.id,
      widget: canonical,
    });

    expect(committed.widgets).toContainEqual(canonical);
    expect(committed.widgets).not.toContainEqual(optimistic);
    expect(committed.pendingWidgetIds).toEqual([]);
  });
});
```

</details>

Il reducer importa `initialWidgets` da `dashboardStorage.ts`, che completerai nel TODO 05. Per far compilare questo checkpoint crea ora la versione minima del file:

`src/dashboard/state/dashboardStorage.ts`

```ts
import type { DashboardWidget } from '../dashboard.types';

export const initialWidgets: DashboardWidget[] = [
  {
    id: 'widget-alerts',
    title: 'Criticità aperte',
    kind: 'alerts',
    size: 'compact',
  },
  {
    id: 'widget-sites',
    title: 'Stato delle sedi',
    kind: 'sites',
    size: 'wide',
  },
  {
    id: 'widget-energy',
    title: 'Consumi energetici',
    kind: 'energy',
    size: 'wide',
  },
  {
    id: 'widget-occupancy',
    title: 'Occupazione media',
    kind: 'occupancy',
    size: 'compact',
  },
];
```

Nel TODO 05 manterrai questo array e aggiungerai lettura, validazione e scrittura del payload persistente.

Nel TODO 03 testi il reducer in isolamento. Non collegarlo ancora alla pagina. Il TODO 04 crea il provider che sostituisce gli handler locali con `dispatch`.

### Vincolo

Il reducer non chiama API, non legge storage e non apre Snackbar.

### Verifica

```bash
npm run test -- src/dashboard/state/dashboardReducer.test.ts
```

### Errori comuni

- Mutare `state.widgets` con `splice`.
- Chiamare `localStorage.setItem` nel reducer.
- Usare azioni generiche come `setState`.

### Checkpoint

- [ ] Ogni azione descrive un evento di dominio.
- [ ] Lo stato sorgente resta immutato.
- [ ] Il reducer copre commit e rollback.
- [ ] Gli spostamenti ai limiti non lanciano errori.

---

## TODO 04: dividi stato e azioni con Context

### Obiettivo

Condividi configurazione e azioni sincrone senza prop drilling. Nel TODO 06 aggiungerai la dipendenza API; nel TODO 09 trasformerai il salvataggio locale in una mutazione asincrona.

### Concetto del Modulo 2

Context risolve la distribuzione. Il reducer risolve le transizioni. Il servizio risolve l'accesso ai dati. Un Context unico mescola questi problemi.

### Relazione tra i Context finali

```text
OperationsDashboard, poi DashboardPage e WidgetCard
  -> useDashboardState()       legge widgets, range, pending e notice
  -> useDashboardActions()     invia setRange, saveWidget, moveWidget e reset
  -> useOperationsApi()        lo usa soltanto useOperationsData
```

In questo checkpoint implementi i primi due Context. Il diagramma mostra anche `useOperationsApi`, che aggiungerai nel TODO 06 dopo aver definito il contratto del servizio.

### File da creare

- `src/dashboard/state/DashboardContext.tsx`

### Context richiesti in questo checkpoint

```tsx
const DashboardStateContext = createContext<DashboardState | null>(null);
const DashboardActionsContext = createContext<DashboardActions | null>(null);
```

### Passaggi guidati

1. Crea `DashboardContext.tsx` e dichiara `DashboardStateContext` e `DashboardActionsContext`.
2. Definisci il tipo `DashboardActions` con `setRange`, `saveWidget`, `removeWidget`, `moveWidget`, `resetLayout` e `clearNotice`.
3. Crea `DashboardProvider`. Al suo interno monta `useReducer(dashboardReducer, ...)` e conserva il risultato in `state` e `dispatch`.
4. Implementa le azioni sincrone. `setRange` e le azioni del layout inviano un evento. `saveWidget` invia subito start e commit, perché in questo checkpoint non chiama ancora un backend.
5. Memorizza l'oggetto `actions` con `useMemo` e monta i due provider attorno a `children`.
6. Esporta `useDashboardState` e `useDashboardActions`. Ogni hook deve lanciare un errore se manca `DashboardProvider`.
7. In `App.tsx`, avvolgi `OperationsDashboard` con `DashboardProvider`. Nel TODO 10 rinominerai il componente in `DashboardPage`.

### Perché separare lettura e comandi

Un componente che deve soltanto inviare `moveWidget` non ha bisogno di conoscere l'intero `DashboardState`. I due Context rendono visibile questa differenza. La separazione non elimina da sola ogni render, ma evita di mescolare API di lettura e API di modifica.

### Risultato del TODO

`App` compone provider e pagina. `OperationsDashboard` usa gli hook della feature e non importa reducer, fixture o implementazione della API.

### Codice da scrivere e stato finale dei file

In questo checkpoint crei soltanto i Context di stato e azioni. `saveWidget` aggiorna il reducer senza latenza. Aggiungerai `OperationsApiContext` nel TODO 06 e renderai `saveWidget` asincrono nel TODO 09.

<details>
<summary>Apri DashboardContext.tsx al termine del TODO 04</summary>

`src/dashboard/state/DashboardContext.tsx`

```tsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';
import { dashboardReducer } from './dashboardReducer';
import { initialWidgets } from './dashboardStorage';

type DashboardActions = {
  setRange: (range: TimeRange) => void;
  saveWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: -1 | 1) => void;
  resetLayout: () => void;
  clearNotice: () => void;
};

const initialState: DashboardState = {
  widgets: initialWidgets.map((widget) => ({ ...widget })),
  range: 'oggi',
  pendingWidgetIds: [],
  notice: null,
};

const DashboardStateContext = createContext<DashboardState | null>(null);
const DashboardActionsContext = createContext<DashboardActions | null>(null);

export function DashboardProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo<DashboardActions>(
    () => ({
      setRange(range) {
        dispatch({ type: 'rangeChanged', range });
      },
      saveWidget(draft) {
        const previous =
          state.widgets.find((widget) => widget.id === draft.id) ?? null;
        const next = {
          ...draft,
          id: draft.id || `widget-${crypto.randomUUID()}`,
          title: draft.title.trim(),
        };
        dispatch({ type: 'widgetChangeStarted', next, previous });
        dispatch({
          type: 'widgetChangeCommitted',
          optimisticId: next.id,
          widget: next,
        });
      },
      removeWidget(widgetId) {
        dispatch({ type: 'widgetRemoved', widgetId });
      },
      moveWidget(widgetId, direction) {
        dispatch({ type: 'widgetMoved', widgetId, direction });
      },
      resetLayout() {
        dispatch({ type: 'layoutReset' });
      },
      clearNotice() {
        dispatch({ type: 'noticeCleared' });
      },
    }),
    [state.widgets],
  );

  return (
    <DashboardActionsContext.Provider value={actions}>
      <DashboardStateContext.Provider value={state}>
        {children}
      </DashboardStateContext.Provider>
    </DashboardActionsContext.Provider>
  );
}

export function useDashboardState() {
  const context = useContext(DashboardStateContext);
  if (!context) {
    throw new Error('useDashboardState richiede DashboardProvider.');
  }
  return context;
}

export function useDashboardActions() {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error('useDashboardActions richiede DashboardProvider.');
  }
  return context;
}
```

</details>

<details>
<summary>Apri App.tsx al termine del TODO 04</summary>

`src/App.tsx`

```tsx
import { OperationsDashboard } from './dashboard/OperationsDashboard';
import { DashboardProvider } from './dashboard/state/DashboardContext';

export function App() {
  return (
    <DashboardProvider>
      <OperationsDashboard />
    </DashboardProvider>
  );
}
```

</details>

Prima di usare il provider nella pagina, sostituisci:

```tsx
const [widgets, setWidgets] = useState(readInitialWidgets);
const [range, setRange] = useState<TimeRange>('oggi');
```

con:

```tsx
const { widgets, range, pendingWidgetIds, notice } = useDashboardState();
const {
  setRange,
  saveWidget,
  removeWidget,
  moveWidget,
  resetLayout,
  clearNotice,
} = useDashboardActions();
```

Passa `saveWidget` a `WidgetEditorDialog`. Collega poi i pulsanti alle altre azioni. Rimuovi dalla pagina `deleteWidget` e `moveWidget` solo dopo aver sostituito tutti i chiamanti.

### Codice chiave

```tsx
const actions = useMemo<DashboardActions>(
  () => ({
    setRange(range) {
      dispatch({ type: 'rangeChanged', range });
    },
    saveWidget(draft) {
      // prepara next, poi invia start e commit nello stesso evento utente
    },
    moveWidget(widgetId, direction) {
      dispatch({ type: 'widgetMoved', widgetId, direction });
    },
    // Le altre azioni sincrone seguono la stessa forma.
  }),
  [state.widgets],
);
```

### Spiegazione

Il provider traduce i comandi usati dai componenti in eventi del reducer. La pagina conosce `moveWidget`; il reducer conosce `widgetMoved`. La chiamata API e la ref dell'ultimo array entrano nel TODO 09.

### Verifica

```bash
rg "createContext" src/dashboard/state
rg "OperationsApi" src/dashboard/components
```

I componenti presentazionali non devono importare il servizio.

### Errori comuni

- Mettere snapshot API e draft nello stesso Context.
- Creare l'istanza del servizio dentro il render.
- Restituire `null` se il provider manca.

### Checkpoint

- [ ] Stato e azioni usano Context distinti.
- [ ] I componenti visuali non chiamano la API.
- [ ] `App` monta un solo `DashboardProvider`.

---

## TODO 05: persisti la configurazione

### Obiettivo

Conserva intervallo e widget dopo il reload. Tollerare un payload corrotto fa parte del primo avvio.

### Concetto del Modulo 2

Persistent state è client state con un ciclo di vita più lungo. Devi definire schema, versione e fallback.

### Dati che entrano e che non entrano nello storage

Salva `range` e `widgets`. Escludi `pendingWidgetIds`, `notice`, `query`, `draft`, snapshot, cache, loading ed errore. Questi valori dipendono dalla sessione corrente, dalla UI o dalla API.

Usa la chiave `react-aziendale:widget-dashboard:v1`. La versione fa parte del contratto: quando lo schema cambierà, potrai distinguere un vecchio payload da uno compatibile.

### File da creare

- `src/dashboard/state/dashboardStorage.ts`

### Schema

```ts
type PersistedDashboard = {
  version: 1;
  range: TimeRange;
  widgets: DashboardWidget[];
};
```

### Passaggi guidati

1. Sposta l'array dei widget iniziali in `dashboardStorage.ts` ed esportalo come `initialWidgets`.
2. Crea `createInitialDashboardState`. Prepara prima un fallback con copie dei widget iniziali, intervallo `oggi`, nessun pending e nessuna notifica.
3. Leggi la chiave con `localStorage.getItem` dentro `try/catch`. Se la chiave manca o il browser nega l'accesso, restituisci il fallback.
4. Analizza il JSON e tratta il risultato come `unknown`. Non usare un cast diretto a `PersistedDashboard`.
5. Crea funzioni di controllo per intervallo e widget. Verifica stringhe non vuote, valori ammessi e id senza duplicati.
6. Accetta il payload soltanto se contiene `version: 1`, un intervallo valido e un array di widget valido. Un array vuoto è un layout valido e non deve attivare il fallback.
7. Usa `createInitialDashboardState` come lazy initializer di `useReducer`. In questo modo leggi lo storage una volta al montaggio.
8. Crea `persistDashboardState` e salva soltanto `version`, `range` e `widgets`.
9. Nel provider aggiungi un Effect che chiama `persistDashboardState` quando cambiano intervallo o widget.
10. Se `pendingWidgetIds` contiene elementi, esci dall'Effect. Aspetta commit o rollback prima di salvare il layout.
11. Aggiungi test per payload valido, JSON corrotto, id duplicati e layout vuoto.

### Perché validare un dato scritto dalla stessa app

L'utente può conservare la chiave tra versioni diverse dell'applicazione. Estensioni, strumenti di sviluppo o vecchie release possono lasciare un valore incompatibile. `JSON.parse` controlla la sintassi, non la forma del dato.

### Risultato del TODO

Un reload ripristina intervallo e disposizione dei widget. Stato della richiesta, cache, errori e modifiche ancora pending ripartono dalla sessione corrente.

### Codice da scrivere e stato finale dei file

Il lazy initializer sostituisce `initialState` usato nel TODO 04. Lo storage diventa l'unico punto che conosce chiave, versione, validazione e fallback.

<details>
<summary>Apri dashboardStorage.ts completo</summary>

`src/dashboard/state/dashboardStorage.ts`

```ts
/** Lo storage salva soltanto configurazione persistente e valida il payload. */
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';

export const dashboardStorageKey = 'react-aziendale:widget-dashboard:v1';

export const initialWidgets: DashboardWidget[] = [
  { id: 'widget-alerts', title: 'Criticità aperte', kind: 'alerts', size: 'compact' },
  { id: 'widget-sites', title: 'Stato delle sedi', kind: 'sites', size: 'wide' },
  { id: 'widget-energy', title: 'Consumi energetici', kind: 'energy', size: 'wide' },
  { id: 'widget-occupancy', title: 'Occupazione media', kind: 'occupancy', size: 'compact' },
];

type PersistedDashboard = {
  version: 1;
  range: TimeRange;
  widgets: DashboardWidget[];
};

function isTimeRange(value: unknown): value is TimeRange {
  return ['oggi', '7-giorni', '30-giorni'].includes(String(value));
}

function isWidget(value: unknown): value is DashboardWidget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    'title' in value &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    'kind' in value &&
    ['alerts', 'sites', 'energy', 'occupancy'].includes(String(value.kind)) &&
    'size' in value &&
    ['compact', 'wide'].includes(String(value.size))
  );
}

function isPersistedDashboard(value: unknown): value is PersistedDashboard {
  if (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 1 &&
    'range' in value &&
    isTimeRange(value.range) &&
    'widgets' in value &&
    Array.isArray(value.widgets) &&
    value.widgets.every(isWidget)
  ) {
    const ids = value.widgets.map((widget) => widget.id);
    return new Set(ids).size === ids.length;
  }

  return false;
}

export function createInitialDashboardState(): DashboardState {
  const fallback: DashboardState = {
    widgets: initialWidgets.map((widget) => ({ ...widget })),
    range: 'oggi',
    pendingWidgetIds: [],
    notice: null,
  };

  try {
    const raw = window.localStorage.getItem(dashboardStorageKey);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedDashboard(parsed)) return fallback;

    return {
      ...fallback,
      range: parsed.range,
      widgets: parsed.widgets.map((widget) => ({ ...widget })),
    };
  } catch {
    return fallback;
  }
}

export function persistDashboardState(
  state: Pick<DashboardState, 'range' | 'widgets'>,
) {
  const payload: PersistedDashboard = {
    version: 1,
    range: state.range,
    widgets: state.widgets,
  };

  try {
    window.localStorage.setItem(dashboardStorageKey, JSON.stringify(payload));
  } catch {
    // La dashboard resta utilizzabile se il browser nega l'accesso allo storage.
  }
}
```

</details>

<details>
<summary>Apri dashboardStorage.test.ts completo</summary>

`src/dashboard/state/dashboardStorage.test.ts`

```ts
/** I test proteggono schema, fallback e layout vuoto nello storage. */
import type { DashboardState } from '../dashboard.types';
import {
  createInitialDashboardState,
  dashboardStorageKey,
  initialWidgets,
  persistDashboardState,
} from './dashboardStorage';

describe('dashboardStorage', () => {
  it('conserva un layout vuoto valido', () => {
    window.localStorage.setItem(
      dashboardStorageKey,
      JSON.stringify({ version: 1, range: '7-giorni', widgets: [] }),
    );

    expect(createInitialDashboardState()).toMatchObject({
      range: '7-giorni',
      widgets: [],
    });
  });

  it('usa il fallback per id duplicati o vuoti', () => {
    window.localStorage.setItem(
      dashboardStorageKey,
      JSON.stringify({
        version: 1,
        range: 'oggi',
        widgets: [
          { id: 'duplicato', title: 'Primo', kind: 'alerts', size: 'compact' },
          { id: 'duplicato', title: 'Secondo', kind: 'sites', size: 'wide' },
        ],
      }),
    );

    expect(createInitialDashboardState().widgets).toEqual(initialWidgets);
  });

  it('salva soltanto lo schema persistente', () => {
    const state: DashboardState = {
      widgets: [],
      range: '30-giorni',
      pendingWidgetIds: ['widget-pending'],
      notice: { severity: 'error', message: 'Errore temporaneo' },
    };

    persistDashboardState(state);

    expect(JSON.parse(window.localStorage.getItem(dashboardStorageKey)!)).toEqual({
      version: 1,
      range: '30-giorni',
      widgets: [],
    });
  });
});
```

</details>

Aggiorna l'inizializzazione del reducer nel provider:

```tsx
const [state, dispatch] = useReducer(
  dashboardReducer,
  undefined,
  createInitialDashboardState,
);
```

Aggiungi poi l'Effect:

```tsx
const pendingWidgetCount = state.pendingWidgetIds.length;

useEffect(() => {
  if (pendingWidgetCount > 0) return;
  persistDashboardState({
    range: state.range,
    widgets: state.widgets,
  });
}, [pendingWidgetCount, state.range, state.widgets]);
```

Elimina dallo starter `storageKey`, `readInitialWidgets`, `isWidgetArray` e il vecchio Effect che salvava soltanto `widgets`.

### Effect ammesso

```tsx
useEffect(() => {
  if (state.pendingWidgetIds.length > 0) return;
  persistDashboardState(state);
}, [state]);
```

Questo Effect sincronizza React con una risorsa esterna. Non calcola derived state.

### Verifica manuale

1. Sposta un widget.
2. Cambia intervallo.
3. Ricarica la pagina.
4. Inserisci JSON non valido nella chiave storage e ricarica.

La dashboard deve usare il fallback senza mostrare una pagina vuota o un errore runtime.

### Checkpoint

- [ ] Il payload contiene `version: 1`.
- [ ] Cache e server state non entrano nello storage.
- [ ] Lo storage contiene soltanto modifiche confermate.
- [ ] Lo storage corrotto non blocca l'app.
- [ ] Il layout vuoto, se scelto, sopravvive al reload.

---

## TODO 06: definisci la API e carica con `useEffect`

### Obiettivo

Sposta accesso ai dati e ciclo della richiesta fuori dalla pagina.

### Concetto del Modulo 2

Il servizio conosce trasporto e cache. Il custom hook conosce il ciclo React. La pagina conosce rendering e azioni utente.

### Divisione dei file

- `services/OperationsApi.ts` esporta solo il contratto TypeScript.
- `services/createSimulatedOperationsApi.ts` adatta `operationsApi.ts`, salva i dati in cache e simula il salvataggio.
- `hooks/useOperationsData.ts` possiede `OperationsLoadState`, l'Effect e le azioni `refresh` e `retry`.
- Il componente di pagina, ancora in `OperationsDashboard.tsx`, sceglie quale messaggio o componente mostrare.

Il click su `Aggiorna dati` non esegue la richiesta direttamente. Invalida la chiave e cambia la versione di refresh. L'Effect osserva quella versione e avvia la richiesta nello stesso punto usato dal caricamento iniziale.

### File da creare

- `src/dashboard/services/OperationsApi.ts`
- `src/dashboard/services/createSimulatedOperationsApi.ts`
- `src/dashboard/hooks/useOperationsData.ts`

### Contratto

```ts
type OperationsApi = {
  getSnapshot: (
    range: TimeRange,
    request: { signal: AbortSignal; force?: boolean },
  ) => Promise<OperationsSnapshot>;
  saveWidget: (widget: DashboardWidget) => Promise<DashboardWidget>;
  invalidate: (range?: TimeRange) => void;
};
```

### Codice da scrivere e stato finale dei file

Crea prima il contratto, poi il custom hook. L'implementazione completa del servizio simulato compare nel TODO 08, dove introduci la cache. Fino a quel checkpoint puoi conservare `operationsApi.ts` come adattatore temporaneo oppure anticipare il file del TODO 08.

<details>
<summary>Apri OperationsApi.ts completo</summary>

`src/dashboard/services/OperationsApi.ts`

```ts
/** Il contratto nasconde latenza, cache e scenari della sorgente dati. */
import type {
  DashboardWidget,
  OperationsSnapshot,
  TimeRange,
} from '../dashboard.types';

export type SnapshotRequest = {
  signal: AbortSignal;
  force?: boolean;
};

export type OperationsApi = {
  getSnapshot: (
    range: TimeRange,
    request: SnapshotRequest,
  ) => Promise<OperationsSnapshot>;
  saveWidget: (
    widget: DashboardWidget,
    signal?: AbortSignal,
  ) => Promise<DashboardWidget>;
  invalidate: (range?: TimeRange) => void;
};
```

</details>

<details>
<summary>Apri useOperationsData.ts completo</summary>

`src/dashboard/hooks/useOperationsData.ts`

```tsx
/**
 * Questo hook possiede il server state e sincronizza la query tramite Effect.
 * AbortController impedisce a una risposta obsoleta di aggiornare la UI.
 */
import { useEffect, useRef, useState } from 'react';
import type {
  OperationsLoadState,
  TimeRange,
} from '../dashboard.types';
import type { OperationsApi } from '../services/OperationsApi';

const initialState: OperationsLoadState = {
  status: 'idle',
  data: null,
  error: null,
  isRefreshing: false,
};

export function useOperationsData(api: OperationsApi, range: TimeRange) {
  const [state, setState] = useState<OperationsLoadState>(initialState);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const handledRefreshVersion = useRef(0);
  const previousRange = useRef(range);

  useEffect(() => {
    const controller = new AbortController();
    const force = refreshVersion !== handledRefreshVersion.current;
    const rangeChanged = previousRange.current !== range;
    handledRefreshVersion.current = refreshVersion;
    previousRange.current = range;

    setState((current) => ({
      status:
        current.data && !rangeChanged
          ? current.data.sites.length === 0
            ? 'empty'
            : 'success'
          : 'loading',
      data: rangeChanged ? null : current.data,
      error: null,
      isRefreshing: Boolean(current.data && !rangeChanged),
    }));

    api
      .getSnapshot(range, { signal: controller.signal, force })
      .then((data) => {
        setState({
          status: data.sites.length === 0 ? 'empty' : 'success',
          data,
          error: null,
          isRefreshing: false,
        });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') {
          return;
        }
        setState((current) => ({
          ...current,
          status: 'error',
          error:
            reason instanceof Error
              ? reason.message
              : 'Errore imprevisto durante il caricamento.',
          isRefreshing: false,
        }));
      });

    return () => controller.abort();
  }, [api, range, refreshVersion]);

  function refresh() {
    api.invalidate(range);
    setRefreshVersion((value) => value + 1);
  }

  return { ...state, refresh, retry: refresh };
}
```

</details>

<details>
<summary>Apri useOperationsData.test.tsx completo</summary>

`src/dashboard/hooks/useOperationsData.test.tsx`

```tsx
/** Il test verifica il contratto più rischioso dell'Effect: annullare la richiesta. */
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OperationsSnapshot } from '../dashboard.types';
import type { TimeRange } from '../dashboard.types';
import type { OperationsApi } from '../services/OperationsApi';
import { useOperationsData } from './useOperationsData';

const snapshot: OperationsSnapshot = {
  sites: [],
  alerts: [],
  updatedAt: '2026-07-23T08:30:00.000Z',
};

const snapshotWithData: OperationsSnapshot = {
  ...snapshot,
  sites: [
    {
      id: 'site-test',
      name: 'Sede Test',
      city: 'Torino',
      health: 'regolare',
      energyKwh: 420,
      occupancy: 68,
    },
  ],
};

describe('useOperationsData', () => {
  it('annulla la richiesta precedente quando cambia intervallo', async () => {
    const signals: AbortSignal[] = [];
    const api: OperationsApi = {
      getSnapshot: (_range, { signal }) => {
        signals.push(signal);
        return new Promise((resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Annullata', 'AbortError')),
            { once: true },
          );
          if (signals.length === 2) resolve(snapshot);
        });
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };

    const { rerender, result } = renderHook(
      ({ range }: { range: TimeRange }) => useOperationsData(api, range),
      { initialProps: { range: 'oggi' as TimeRange } },
    );

    rerender({ range: '7-giorni' });

    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('forza una nuova richiesta durante il refresh', async () => {
    const forces: boolean[] = [];
    const api: OperationsApi = {
      getSnapshot: async (_range, request) => {
        forces.push(Boolean(request.force));
        return snapshot;
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };
    const { result } = renderHook(() => useOperationsData(api, 'oggi'));
    await waitFor(() => expect(result.current.status).toBe('empty'));

    act(() => result.current.refresh());
    await waitFor(() => expect(forces).toHaveLength(2));
    expect(forces).toEqual([false, true]);
  });

  it('rimuove l\'errore e conserva i dati durante il retry', async () => {
    let resolveRetry!: (value: OperationsSnapshot) => void;
    let requestCount = 0;
    const api: OperationsApi = {
      getSnapshot: async () => {
        requestCount += 1;
        if (requestCount === 1) return snapshotWithData;
        if (requestCount === 2) throw new Error('Servizio non disponibile');
        return new Promise((resolve) => {
          resolveRetry = resolve;
        });
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };
    const { result } = renderHook(() => useOperationsData(api, 'oggi'));
    await waitFor(() => expect(result.current.status).toBe('success'));

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => result.current.retry());
    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.error).toBeNull();
      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.data).toEqual(snapshotWithData);
    });

    await act(async () => resolveRetry(snapshotWithData));
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
  });
});
```

</details>

Il provider richiede un'istanza concreta di `OperationsApi`. Crea già i due file seguenti. Il TODO 08 analizzerà cache, TTL e invalidazione riga per riga e aggiungerà i test del servizio.

<details>
<summary>Apri operations.fixture.ts completo</summary>

`src/dashboard/services/operations.fixture.ts`

```ts
/** Le fixture sono deterministiche per demo, test e primo avvio offline. */
import type { OperationsAlert, Site } from '../dashboard.types';

export const siteFixtures: Site[] = [
  {
    id: 'site-torino',
    name: 'Sede Torino',
    city: 'Torino',
    health: 'regolare',
    energyKwh: 684,
    occupancy: 72,
  },
  {
    id: 'site-bologna',
    name: 'Hub Bologna',
    city: 'Bologna',
    health: 'attenzione',
    energyKwh: 518,
    occupancy: 61,
  },
  {
    id: 'site-padova',
    name: 'Centro Padova',
    city: 'Padova',
    health: 'critica',
    energyKwh: 742,
    occupancy: 84,
  },
  {
    id: 'site-bari',
    name: 'Sede Bari',
    city: 'Bari',
    health: 'regolare',
    energyKwh: 431,
    occupancy: 48,
  },
];

export const alertFixtures: OperationsAlert[] = [
  {
    id: 'alert-ventilation',
    siteId: 'site-padova',
    title: 'Ventilazione sala server oltre soglia',
    severity: 'alta',
  },
  {
    id: 'alert-access',
    siteId: 'site-bologna',
    title: 'Lettore accessi piano 2 intermittente',
    severity: 'media',
  },
  {
    id: 'alert-energy',
    siteId: 'site-padova',
    title: 'Consumo fuori fascia nella notte',
    severity: 'media',
  },
];
```

</details>

<details>
<summary>Apri createSimulatedOperationsApi.ts completo</summary>

`src/dashboard/services/createSimulatedOperationsApi.ts`

```ts
/**
 * La API simulata offre cache TTL, abort e fallimenti ripetibili.
 * Il resto dell'app dipende dal contratto OperationsApi, non dalle fixture.
 */
import type { OperationsSnapshot, TimeRange } from '../dashboard.types';
import type { OperationsApi } from './OperationsApi';
import { alertFixtures, siteFixtures } from './operations.fixture';

type ApiOptions = {
  latencyMs?: number;
  cacheTtlMs?: number;
  scenario?: string | null;
  now?: () => number;
};

type CacheEntry = {
  snapshot: OperationsSnapshot;
  cachedAt: number;
};

function cloneSnapshot(snapshot: OperationsSnapshot): OperationsSnapshot {
  return {
    sites: snapshot.sites.map((site) => ({ ...site })),
    alerts: snapshot.alerts.map((alert) => ({ ...alert })),
    updatedAt: snapshot.updatedAt,
  };
}

function abortError() {
  return new DOMException('Richiesta annullata', 'AbortError');
}

function wait(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function buildSnapshot(range: TimeRange): OperationsSnapshot {
  const multiplier = range === 'oggi' ? 1 : range === '7-giorni' ? 6.4 : 25.7;
  return {
    sites: siteFixtures.map((site) => ({
      ...site,
      energyKwh: Math.round(site.energyKwh * multiplier),
    })),
    alerts: alertFixtures.map((alert) => ({ ...alert })),
    updatedAt: '2026-07-23T08:30:00.000Z',
  };
}

export function createSimulatedOperationsApi({
  latencyMs = 350,
  cacheTtlMs = 30_000,
  scenario = new URLSearchParams(window.location.search).get('scenario'),
  now = Date.now,
}: ApiOptions = {}): OperationsApi {
  const cache = new Map<TimeRange, CacheEntry>();
  let readFailed = false;
  let saveFailed = false;

  return {
    async getSnapshot(range, { signal, force = false }) {
      const cached = cache.get(range);
      if (!force && cached && now() - cached.cachedAt < cacheTtlMs) {
        return cloneSnapshot(cached.snapshot);
      }

      await wait(latencyMs, signal);

      if (scenario === 'error-once' && !readFailed) {
        readFailed = true;
        throw new Error('Il servizio operativo non risponde.');
      }

      const snapshot =
        scenario === 'empty'
          ? { sites: [], alerts: [], updatedAt: '2026-07-23T08:30:00.000Z' }
          : buildSnapshot(range);

      cache.set(range, { snapshot: cloneSnapshot(snapshot), cachedAt: now() });
      return cloneSnapshot(snapshot);
    },

    async saveWidget(widget, signal) {
      await wait(latencyMs, signal);

      const titleRequestsRollback = widget.title
        .toLocaleLowerCase('it-IT')
        .includes('rollback');
      if (
        titleRequestsRollback ||
        (scenario === 'save-error-once' && !saveFailed)
      ) {
        saveFailed = true;
        throw new Error('Il backend ha rifiutato la modifica del widget.');
      }

      return { ...widget };
    },

    invalidate(range) {
      if (range) cache.delete(range);
      else cache.clear();
    },
  };
}
```

</details>

Nel provider importa la factory e crea l'istanza fuori dal componente:

```tsx
import { createSimulatedOperationsApi } from '../services/createSimulatedOperationsApi';

const defaultApi = createSimulatedOperationsApi();
```

Nel provider aggiungi il Context della API:

```tsx
const OperationsApiContext = createContext<OperationsApi | null>(null);

type DashboardProviderProps = PropsWithChildren<{ api?: OperationsApi }>;

export function DashboardProvider({
  children,
  api = defaultApi,
}: DashboardProviderProps) {
  // reducer, azioni ed Effect dello storage

  return (
    <OperationsApiContext.Provider value={api}>
      <DashboardActionsContext.Provider value={actions}>
        <DashboardStateContext.Provider value={state}>
          {children}
        </DashboardStateContext.Provider>
      </DashboardActionsContext.Provider>
    </OperationsApiContext.Provider>
  );
}

export function useOperationsApi() {
  const context = useContext(OperationsApiContext);
  if (!context) {
    throw new Error('useOperationsApi richiede DashboardProvider.');
  }
  return context;
}
```

In `OperationsDashboard` sostituisci la prop `loadSnapshot` con:

```tsx
const api = useOperationsApi();
const operations = useOperationsData(api, range);
```

Da questo punto i test possono passare una API controllata ad `App` o a `DashboardProvider`.

### Effect della richiesta

```tsx
useEffect(() => {
  const controller = new AbortController();

  api
    .getSnapshot(range, { signal: controller.signal, force })
    .then((data) => {
      setState({
        status: data.sites.length === 0 ? 'empty' : 'success',
        data,
        error: null,
        isRefreshing: false,
      });
    })
    .catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      // pubblica l'errore applicativo
    });

  return () => controller.abort();
}, [api, range, refreshVersion]);
```

### Passaggi guidati

1. Crea `OperationsApi.ts` e trasferisci nel contratto le tre operazioni richieste dalla feature: lettura dello snapshot, salvataggio di un widget e invalidazione della cache.
2. Crea `createSimulatedOperationsApi.ts`. Sposta in questo file fixture, latenza simulata e costruzione dello snapshot che si trovano in `operationsApi.ts`.
3. Fai restituire alla factory un oggetto conforme a `OperationsApi`. La pagina non deve più conoscere `fetchOperationsSnapshot`.
4. Aggiungi `OperationsLoadState` a `dashboard.types.ts`. Usa `idle`, `loading`, `success`, `empty` ed `error` per distinguere le fasi.
5. Crea `useOperationsData(api, range)` con lo stato iniziale privo di dati ed errori.
6. Dentro l'Effect crea un nuovo `AbortController`. Imposta lo stato di caricamento prima di chiamare `api.getSnapshot`.
7. Passa `controller.signal` alla API. Se la Promise termina con successo, pubblica i dati e scegli `empty` quando `sites.length` vale zero.
8. Nel `catch`, ignora solo un errore con nome `AbortError`. Per gli altri errori conserva il messaggio e usa lo stato `error`.
9. Restituisci `() => controller.abort()` dalla cleanup. React la esegue prima di una nuova richiesta e quando smonta il componente.
10. Inserisci `api`, `range` e `refreshVersion` nelle dipendenze. Non disabilitare la regola del linter.
11. Restituisci dal custom hook dati, stato, errore, `isRefreshing`, `refresh` e `retry`.
12. In `OperationsDashboard`, ottieni la API con `useOperationsApi` e passa `range` a `useOperationsData`.

### Segui una richiesta

```text
OperationsDashboard
  -> useOperationsData(api, range)
  -> Effect crea AbortController
  -> api.getSnapshot(range, { signal })
  -> Promise risolta: success o empty
  -> Promise rifiutata: error
  -> cambio range o unmount: abort
```

Il custom hook coordina React e la risorsa esterna. Il servizio decide come ottenere i dati. La pagina decide come mostrarli.

### Risultato del TODO

`OperationsDashboard` non contiene Promise, controller o dettagli della sorgente dati. Il cambio di intervallo annulla la richiesta precedente e ne avvia una nuova.

### Verifica

```bash
npm run test -- src/dashboard/hooks/useOperationsData.test.tsx
```

### Errori comuni

- Rendere la funzione dell'Effect `async`.
- Riutilizzare lo stesso `AbortController` tra richieste.
- Nascondere dipendenze per eliminare il warning del linter.
- Avviare la lettura in un click e duplicare il ciclo in più handler.

### Checkpoint

- [ ] Ogni richiesta possiede un controller.
- [ ] Il cambio intervallo annulla la richiesta precedente.
- [ ] L'abort non mostra un Alert.
- [ ] StrictMode non produce dati duplicati.

---

## TODO 07: completa loading, error, empty state e retry

### Obiettivo

Rendi espliciti tutti gli stati asincroni. Mantieni i dati durante un refresh.

### Concetto del Modulo 2

Server state comprende dati, stato della richiesta, errore e timestamp. `null` non distingue caricamento, dataset vuoto ed errore.

### Rami di rendering da ottenere

Implementa i rami in `OperationsDashboard` in questo ordine:

1. `loading` senza `data`: quattro Skeleton con `role="status"`.
2. `error`: Alert con il messaggio e pulsante `Riprova`.
3. `empty`: messaggio `Nessuna sede disponibile`.
4. `data` con sedi: griglia dei widget.
5. `isRefreshing`: progress bar sopra la griglia già visibile.

La ricerca agisce sui widget, non sulle sedi. Perciò `visibleWidgets.length === 0` deve mostrare il messaggio di filtro solo quando la API ha già restituito almeno una sede.

### Tipo richiesto

```ts
type OperationsLoadState = {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  data: OperationsSnapshot | null;
  error: string | null;
  isRefreshing: boolean;
};
```

### Passaggi guidati

1. Sostituisci in `OperationsDashboard` i controlli su `loadStatus`, `snapshot` ed `error` con il valore restituito da `useOperationsData`.
2. Per `loading` senza dati, mostra gli Skeleton. Non rendere la griglia perché non possiedi ancora uno snapshot.
3. Per `error`, mostra un Alert con il messaggio ricevuto dal custom hook. Collega il pulsante `Riprova` a `operations.retry`.
4. Per `empty`, mostra `Nessuna sede disponibile`. Questo ramo indica una risposta valida con `sites: []`.
5. Quando `operations.data` contiene sedi, passa lo snapshot ai widget e rendi la griglia.
6. Mantieni separati i due casi di UI vuota. `widgets.length === 0` significa che l'utente ha rimosso il layout; `visibleWidgets.length === 0` significa che la ricerca non trova corrispondenze.
7. Durante un refresh conserva `operations.data` e mostra una `LinearProgress`. La griglia deve restare montata.
8. Quando cambia `range`, elimina invece i dati dell'intervallo precedente e mostra il caricamento iniziale. Eviti così di presentare valori di `Oggi` sotto l'etichetta `Ultimi 30 giorni`.
9. Usa `role="status"` per loading ed empty state. L'Alert fornisce già la semantica di errore.

### Differenza tra primo caricamento e refresh

Nel primo caricamento non esiste un dato da mostrare. Nel refresh esiste uno snapshot valido mentre la nuova richiesta è in corso. `isRefreshing` conserva questa differenza senza introdurre un secondo snapshot.

### Risultato del TODO

Ogni combinazione significativa produce una UI riconoscibile: caricamento iniziale, errore, risposta vuota, successo, refresh e ricerca senza risultati.

### Codice da scrivere nella pagina

Rimuovi dalla pagina `snapshot`, `loadStatus`, `error`, `retryToken` e l'Effect che chiamava `loadSnapshot`. Il custom hook introdotto nel TODO 06 sostituisce tutti questi valori.

Subito dopo l'`AppBar`, usa il ramo di refresh:

```tsx
{operations.isRefreshing ? (
  <LinearProgress aria-label="Aggiornamento dati" />
) : null}
```

Nel contenuto principale sostituisci i vecchi rami asincroni con questi blocchi:

```tsx
{operations.status === 'loading' && !operations.data ? (
  <Box
    role="status"
    aria-label="Caricamento dashboard"
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
      gap: 2,
    }}
  >
    {[0, 1, 2, 3].map((item) => (
      <Skeleton key={item} variant="rounded" height={220} />
    ))}
  </Box>
) : null}

{operations.status === 'error' ? (
  <Alert
    severity="error"
    icon={<ErrorOutlineIcon />}
    sx={{ mb: operations.data ? 2 : 0 }}
    action={
      <Button color="inherit" onClick={operations.retry}>
        Riprova
      </Button>
    }
  >
    <Typography sx={{ fontWeight: 700 }}>
      Dati non disponibili
    </Typography>
    {operations.error}
  </Alert>
) : null}

{operations.status === 'empty' ? (
  <Paper
    role="status"
    variant="outlined"
    sx={{ p: 5, textAlign: 'center' }}
  >
    <BusinessIcon
      color="primary"
      sx={{ fontSize: 40 }}
      aria-hidden="true"
    />
    <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
      Nessuna sede disponibile
    </Typography>
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      Aggiorna i dati oppure verifica la sorgente API.
    </Typography>
  </Paper>
) : null}
```

Rendi la griglia soltanto con uno snapshot utilizzabile:

```tsx
{operations.data && operations.data.sites.length > 0 ? (
  widgets.length === 0 ? (
    <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
      <Typography component="h2" variant="h2">
        Nessun widget configurato
      </Typography>
      <Button sx={{ mt: 2 }} onClick={() => setEditor({ mode: 'create' })}>
        Crea il primo widget
      </Button>
    </Paper>
  ) : visibleWidgets.length > 0 ? (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {/* Mantieni qui il map dei widget dello starter. */}
    </Box>
  ) : (
    <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
      <Typography component="h2" variant="h2">
        Nessun widget corrisponde alla ricerca
      </Typography>
      <Button sx={{ mt: 2 }} onClick={() => setQuery('')}>
        Azzera ricerca
      </Button>
    </Paper>
  )
) : null}
```

Il commento nel `map` indica il solo blocco da conservare dallo starter. Nel TODO 10 lo sostituirai con `WidgetCard` e troverai il file `DashboardPage.tsx` completo.

### Criteri di accettazione

- `error-once` mostra l'errore e il retry recupera.
- `empty` mostra `Nessuna sede disponibile`.
- La ricerca senza risultati mostra `Nessun widget corrisponde alla ricerca`.
- Un refresh non smonta la griglia corrente.

### Errori comuni

- Mostrare spinner, Alert e griglia nello stesso primo caricamento.
- Trattare una lista filtrata vuota come risposta API vuota.
- Ricaricare l'intera pagina per il retry.

### Checkpoint

- [ ] Ogni stato possiede un messaggio e un'azione coerente.
- [ ] I cambiamenti sono annunciati con ruoli accessibili.
- [ ] Retry non usa `window.location.reload`.
- [ ] La griglia resta leggibile a 390 pixel.

---

## TODO 08: aggiungi cache, refresh e invalidazione

### Obiettivo

Evita letture ripetute per dati freschi e consenti un aggiornamento forzato.

### Concetto del Modulo 2

La cache appartiene al server state. La chiave deve includere ogni input che cambia la risposta.

### Dove scrivere il codice

Inserisci la `Map` dentro `createSimulatedOperationsApi.ts`, nello scope della factory. In questo modo ogni istanza API ha una cache isolata e i test possono crearne una nuova. Non esportare la cache e non inserirla in un Context.

### Implementazione guidata

```ts
type CacheEntry = {
  snapshot: OperationsSnapshot;
  cachedAt: number;
};

const cache = new Map<TimeRange, CacheEntry>();
```

1. Aggiungi `cacheTtlMs` e `now` alle opzioni della factory. I valori predefiniti sono 30 secondi e `Date.now`.
2. Crea la `Map` dentro `createSimulatedOperationsApi`. Usa `TimeRange` come chiave perché l'intervallo modifica lo snapshot.
3. All'inizio di `getSnapshot`, cerca la voce con `cache.get(range)`.
4. Calcola l'età con `now() - cached.cachedAt`. Restituisci il dato in cache soltanto se l'età è minore del TTL e `force` vale `false`.
5. Dopo una lettura simulata riuscita, salva snapshot e timestamp nella `Map`.
6. Crea `cloneSnapshot` e usalo sia quando salvi sia quando restituisci. Il chiamante non deve poter mutare per riferimento il dato conservato.
7. Implementa `invalidate(range)`. Se riceve un intervallo elimina quella chiave; senza argomento svuota l'intera cache.
8. Nel custom hook, `refresh` chiama `api.invalidate(range)` e incrementa `refreshVersion`.
9. L'Effect riconosce il refresh e passa `force: true` a `getSnapshot`. Un normale cambio di intervallo può invece usare una voce fresca.
10. Nei test inietta `now` e una latenza ridotta. Avanza il valore dell'orologio senza attendere 30 secondi reali.

### Esempio di decisione

Se carichi `Oggi`, poi `Ultimi 7 giorni` e torni a `Oggi` entro il TTL, il servizio trova la chiave `oggi` e restituisce la copia in cache. Il pulsante `Aggiorna dati` invalida la stessa chiave e forza una nuova lettura.

### Risultato del TODO

La cache resta invisibile ai componenti. La pagina usa sempre `refresh`; il servizio decide se restituire un dato fresco o avviare una nuova lettura.

### Codice da scrivere e stato finale dei file

Ora sostituisci l'adattatore temporaneo del TODO 06 con il servizio completo. Il contratto `OperationsApi` non cambia, quindi custom hook e componenti non richiedono modifiche.

<details>
<summary>Apri operations.fixture.ts completo</summary>

`src/dashboard/services/operations.fixture.ts`

```ts
/** Le fixture sono deterministiche per demo, test e primo avvio offline. */
import type { OperationsAlert, Site } from '../dashboard.types';

export const siteFixtures: Site[] = [
  {
    id: 'site-torino',
    name: 'Sede Torino',
    city: 'Torino',
    health: 'regolare',
    energyKwh: 684,
    occupancy: 72,
  },
  {
    id: 'site-bologna',
    name: 'Hub Bologna',
    city: 'Bologna',
    health: 'attenzione',
    energyKwh: 518,
    occupancy: 61,
  },
  {
    id: 'site-padova',
    name: 'Centro Padova',
    city: 'Padova',
    health: 'critica',
    energyKwh: 742,
    occupancy: 84,
  },
  {
    id: 'site-bari',
    name: 'Sede Bari',
    city: 'Bari',
    health: 'regolare',
    energyKwh: 431,
    occupancy: 48,
  },
];

export const alertFixtures: OperationsAlert[] = [
  {
    id: 'alert-ventilation',
    siteId: 'site-padova',
    title: 'Ventilazione sala server oltre soglia',
    severity: 'alta',
  },
  {
    id: 'alert-access',
    siteId: 'site-bologna',
    title: 'Lettore accessi piano 2 intermittente',
    severity: 'media',
  },
  {
    id: 'alert-energy',
    siteId: 'site-padova',
    title: 'Consumo fuori fascia nella notte',
    severity: 'media',
  },
];
```

</details>

<details>
<summary>Apri createSimulatedOperationsApi.ts completo</summary>

`src/dashboard/services/createSimulatedOperationsApi.ts`

```ts
/**
 * La API simulata offre cache TTL, abort e fallimenti ripetibili.
 * Il resto dell'app dipende dal contratto OperationsApi, non dalle fixture.
 */
import type { OperationsSnapshot, TimeRange } from '../dashboard.types';
import type { OperationsApi } from './OperationsApi';
import { alertFixtures, siteFixtures } from './operations.fixture';

type ApiOptions = {
  latencyMs?: number;
  cacheTtlMs?: number;
  scenario?: string | null;
  now?: () => number;
};

type CacheEntry = {
  snapshot: OperationsSnapshot;
  cachedAt: number;
};

function cloneSnapshot(snapshot: OperationsSnapshot): OperationsSnapshot {
  return {
    sites: snapshot.sites.map((site) => ({ ...site })),
    alerts: snapshot.alerts.map((alert) => ({ ...alert })),
    updatedAt: snapshot.updatedAt,
  };
}

function abortError() {
  return new DOMException('Richiesta annullata', 'AbortError');
}

function wait(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function buildSnapshot(range: TimeRange): OperationsSnapshot {
  const multiplier = range === 'oggi' ? 1 : range === '7-giorni' ? 6.4 : 25.7;
  return {
    sites: siteFixtures.map((site) => ({
      ...site,
      energyKwh: Math.round(site.energyKwh * multiplier),
    })),
    alerts: alertFixtures.map((alert) => ({ ...alert })),
    updatedAt: '2026-07-23T08:30:00.000Z',
  };
}

export function createSimulatedOperationsApi({
  latencyMs = 350,
  cacheTtlMs = 30_000,
  scenario = new URLSearchParams(window.location.search).get('scenario'),
  now = Date.now,
}: ApiOptions = {}): OperationsApi {
  const cache = new Map<TimeRange, CacheEntry>();
  let readFailed = false;
  let saveFailed = false;

  return {
    async getSnapshot(range, { signal, force = false }) {
      const cached = cache.get(range);
      if (!force && cached && now() - cached.cachedAt < cacheTtlMs) {
        return cloneSnapshot(cached.snapshot);
      }

      await wait(latencyMs, signal);

      if (scenario === 'error-once' && !readFailed) {
        readFailed = true;
        throw new Error('Il servizio operativo non risponde.');
      }

      const snapshot =
        scenario === 'empty'
          ? { sites: [], alerts: [], updatedAt: '2026-07-23T08:30:00.000Z' }
          : buildSnapshot(range);

      cache.set(range, { snapshot: cloneSnapshot(snapshot), cachedAt: now() });
      return cloneSnapshot(snapshot);
    },

    async saveWidget(widget, signal) {
      await wait(latencyMs, signal);

      const titleRequestsRollback = widget.title
        .toLocaleLowerCase('it-IT')
        .includes('rollback');
      if (
        titleRequestsRollback ||
        (scenario === 'save-error-once' && !saveFailed)
      ) {
        saveFailed = true;
        throw new Error('Il backend ha rifiutato la modifica del widget.');
      }

      return { ...widget };
    },

    invalidate(range) {
      if (range) cache.delete(range);
      else cache.clear();
    },
  };
}
```

</details>

<details>
<summary>Apri createSimulatedOperationsApi.test.ts completo</summary>

`src/dashboard/services/createSimulatedOperationsApi.test.ts`

```ts
/** I test verificano cache, copie difensive, abort e fallimenti controllati. */
import { vi } from 'vitest';
import { createSimulatedOperationsApi } from './createSimulatedOperationsApi';

describe('createSimulatedOperationsApi', () => {
  it('usa la cache entro il TTL e permette un refresh forzato', async () => {
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    let now = 0;
    const api = createSimulatedOperationsApi({
      latencyMs: 0,
      cacheTtlMs: 1_000,
      now: () => now,
    });

    const first = await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    first.sites[0].name = 'Valore mutato dal consumer';
    const cached = await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    now = 1_001;
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
      force: true,
    });
    api.invalidate('oggi');
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });

    expect(cached.sites[0].name).toBe('Sede Torino');
    expect(timeoutSpy).toHaveBeenCalledTimes(4);
    timeoutSpy.mockRestore();
  });

  it('annulla una richiesta in corso', async () => {
    const api = createSimulatedOperationsApi({ latencyMs: 10_000 });
    const controller = new AbortController();
    const request = api.getSnapshot('oggi', { signal: controller.signal });

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rende ripetibile il fallimento del primo salvataggio', async () => {
    const api = createSimulatedOperationsApi({
      latencyMs: 0,
      scenario: 'save-error-once',
    });
    const widget = {
      id: 'widget-test',
      title: 'Widget test',
      kind: 'alerts' as const,
      size: 'compact' as const,
    };

    await expect(api.saveWidget(widget)).rejects.toThrow(
      'Il backend ha rifiutato la modifica del widget.',
    );
    await expect(api.saveWidget(widget)).resolves.toEqual(widget);
  });
});
```

</details>

Crea una sola istanza predefinita fuori dal render del provider:

```tsx
const defaultApi = createSimulatedOperationsApi();
```

Se la creassi dentro `DashboardProvider`, ogni render produrrebbe una nuova `Map`, perderebbe la cache e cambierebbe la dipendenza `api` del custom hook.

### Perché restituiamo copie

Un consumer non deve mutare la cache per riferimento. Fixture e risultati dei test restano isolati.

### Verifica manuale

1. Carica `Oggi`.
2. Passa a `Ultimi 7 giorni`.
3. Torna a `Oggi` entro 30 secondi.
4. Premi `Aggiorna dati`.

Il terzo passaggio usa la cache. Il quarto forza una richiesta.

### Limite dichiarato

Questa cache didattica non offre garbage collection, deduplicazione concorrente o sincronizzazione tra tab. Librerie dedicate coprono questi problemi in applicazioni più ampie.

### Checkpoint

- [ ] La query key contiene l'intervallo.
- [ ] Il TTL usa un orologio iniettabile nei test.
- [ ] Refresh invalida e forza.
- [ ] La cache non entra in Context o storage.

---

## TODO 09: salva i widget con optimistic update e rollback

### Obiettivo

Aggiorna la UI prima della risposta. Ripristina il solo widget coinvolto se il servizio rifiuta.

### Concetto del Modulo 2

Un optimistic update richiede snapshot precedente, identità dell'operazione e stato pending. Il rollback non deve sostituire dati estranei.

### Chi fa cosa

`WidgetEditorDialog` invia il draft. `OperationsDashboard` chiude il Dialog. `DashboardProvider` trova il widget precedente, invia le azioni al reducer e chiama `api.saveWidget`. Il reducer aggiorna soltanto lo stato in memoria. Il provider persiste il layout dopo commit o rollback, quando non restano operazioni pending.

### Sequenza

```text
submit
  -> trova previous
  -> dispatch widgetChangeStarted
  -> chiama api.saveWidget
  -> successo: widgetChangeCommitted
  -> errore: widgetChangeRolledBack(previous)
```

### Codice chiave

```tsx
dispatch({ type: 'widgetChangeStarted', next, previous });

try {
  const savedWidget = await api.saveWidget(next);
  dispatch({
    type: 'widgetChangeCommitted',
    optimisticId: next.id,
    widget: savedWidget,
  });
  return true;
} catch (reason: unknown) {
  dispatch({
    type: 'widgetChangeRolledBack',
    widgetId: next.id,
    previous,
    message:
      reason instanceof Error
        ? reason.message
        : 'Il salvataggio del widget non è riuscito.',
  });
  return false;
}
```

### Passaggi guidati

1. Implementa `saveWidget` nel provider, non nel reducer e non in un Effect.
2. Cerca in `widgetsRef.current` un widget con lo stesso id del draft. Salvalo in `previous`; per una creazione il risultato sarà `null`.
3. Prepara `next`: genera un id con `crypto.randomUUID()` quando il draft non lo possiede e normalizza il titolo con `trim()`.
4. Invia `widgetChangeStarted` prima di attendere la API. Il reducer aggiorna subito il layout e registra l'id in `pendingWidgetIds`.
5. Chiama `api.saveWidget(next)` dentro `try/catch`.
6. Nel `try`, usa il widget restituito dal servizio per `widgetChangeCommitted`. La API potrebbe assegnare un id canonico o normalizzare altri campi.
7. Nel `catch`, invia `widgetChangeRolledBack` con id, `previous` e messaggio.
8. Nel markup della card ancora presente in `OperationsDashboard`, controlla se l'id compare in `pendingWidgetIds`. Disabilita modifica, eliminazione e spostamento per quel widget finché la richiesta termina. Nel TODO 10 sposterai questo markup in `WidgetCard`.
9. Disabilita `Ripristina layout` quando esiste almeno un widget pending. Eviti che un rollback tardivo si sovrapponga a un reset.
10. Mostra `notice` con una Snackbar. Alla chiusura chiama `clearNotice`.
11. Mantieni il controllo dello storage introdotto nel TODO 05. Il provider non persiste la versione ottimistica mentre esistono id pending.

### Esempio di modifica riuscita

```text
Titolo corrente: Criticità aperte
submit: Criticità urgenti
  -> il reducer mostra subito Criticità urgenti
  -> la API conferma
  -> commit rimuove pending
  -> lo storage salva il nuovo titolo
```

### Esempio di rollback

```text
Titolo corrente: Criticità aperte
submit: Criticità rollback
  -> il reducer mostra il titolo nuovo
  -> la API rifiuta
  -> rollback ripristina Criticità aperte
  -> la Snackbar comunica l'errore
```

### Risultato del TODO

La dashboard risponde al submit senza attendere la latenza. Un errore ripristina soltanto il widget coinvolto e lascia inalterate le altre modifiche.

### Codice da scrivere e stato finale del provider

Sostituisci il `DashboardContext.tsx` intermedio del TODO 04 con il file completo. Qui entrano `OperationsApiContext`, persistenza, callback asincrona, optimistic update e rollback.

<details>
<summary>Apri DashboardContext.tsx completo</summary>

`src/dashboard/state/DashboardContext.tsx`

```tsx
/**
 * I Context separano lettura, azioni e servizio.
 * Un consumer che invia azioni non dipende dalla forma dello stato globale.
 */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';
import { createSimulatedOperationsApi } from '../services/createSimulatedOperationsApi';
import type { OperationsApi } from '../services/OperationsApi';
import { dashboardReducer } from './dashboardReducer';
import {
  createInitialDashboardState,
  persistDashboardState,
} from './dashboardStorage';

type DashboardActions = {
  setRange: (range: TimeRange) => void;
  saveWidget: (widget: DashboardWidget) => Promise<boolean>;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: -1 | 1) => void;
  resetLayout: () => void;
  clearNotice: () => void;
};

const defaultApi = createSimulatedOperationsApi();
const DashboardStateContext = createContext<DashboardState | null>(null);
const DashboardActionsContext = createContext<DashboardActions | null>(null);
const OperationsApiContext = createContext<OperationsApi | null>(null);

type DashboardProviderProps = PropsWithChildren<{ api?: OperationsApi }>;

export function DashboardProvider({ children, api = defaultApi }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    undefined,
    createInitialDashboardState,
  );
  const widgetsRef = useRef(state.widgets);
  const pendingWidgetCount = state.pendingWidgetIds.length;

  useLayoutEffect(() => {
    widgetsRef.current = state.widgets;
  }, [state.widgets]);

  // Persistiamo soltanto configurazione e intervallo, mai server state o pending.
  useEffect(() => {
    if (pendingWidgetCount > 0) return;
    persistDashboardState({ range: state.range, widgets: state.widgets });
  }, [pendingWidgetCount, state.range, state.widgets]);

  const setRange = useCallback((range: TimeRange) => {
    dispatch({ type: 'rangeChanged', range });
  }, []);

  const saveWidget = useCallback(
    async (draft: DashboardWidget) => {
      const previous =
        widgetsRef.current.find((widget) => widget.id === draft.id) ?? null;
      const next = {
        ...draft,
        id: draft.id || `widget-${crypto.randomUUID()}`,
        title: draft.title.trim(),
      };

      dispatch({ type: 'widgetChangeStarted', next, previous });

      try {
        const savedWidget = await api.saveWidget(next);
        dispatch({
          type: 'widgetChangeCommitted',
          optimisticId: next.id,
          widget: savedWidget,
        });
        return true;
      } catch (reason: unknown) {
        dispatch({
          type: 'widgetChangeRolledBack',
          widgetId: next.id,
          previous,
          message:
            reason instanceof Error
              ? reason.message
              : 'Il salvataggio del widget non è riuscito.',
        });
        return false;
      }
    },
    [api],
  );

  const actions = useMemo<DashboardActions>(
    () => ({
      setRange,
      saveWidget,
      removeWidget(widgetId) {
        dispatch({ type: 'widgetRemoved', widgetId });
      },
      moveWidget(widgetId, direction) {
        dispatch({ type: 'widgetMoved', widgetId, direction });
      },
      resetLayout() {
        dispatch({ type: 'layoutReset' });
      },
      clearNotice() {
        dispatch({ type: 'noticeCleared' });
      },
    }),
    [saveWidget, setRange],
  );

  return (
    <OperationsApiContext.Provider value={api}>
      <DashboardActionsContext.Provider value={actions}>
        <DashboardStateContext.Provider value={state}>
          {children}
        </DashboardStateContext.Provider>
      </DashboardActionsContext.Provider>
    </OperationsApiContext.Provider>
  );
}

export function useDashboardState() {
  const context = useContext(DashboardStateContext);
  if (!context) {
    throw new Error('useDashboardState richiede DashboardProvider.');
  }
  return context;
}

export function useDashboardActions() {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error('useDashboardActions richiede DashboardProvider.');
  }
  return context;
}

export function useOperationsApi() {
  const context = useContext(OperationsApiContext);
  if (!context) {
    throw new Error('useOperationsApi richiede DashboardProvider.');
  }
  return context;
}
```

</details>

Collega la pagina al provider con questi valori:

```tsx
const { widgets, range, pendingWidgetIds, notice } = useDashboardState();
const {
  setRange,
  saveWidget,
  removeWidget,
  moveWidget,
  resetLayout,
  clearNotice,
} = useDashboardActions();

function handleSave(widget: DashboardWidget) {
  setEditor(null);
  void saveWidget(widget);
}
```

Nel `map` dei widget calcola il pending:

```tsx
const isPending = pendingWidgetIds.includes(widget.id);
```

Usa `isPending` per disabilitare i pulsanti del widget. Aggiungi poi il reset e la Snackbar:

```tsx
<Button
  startIcon={<RestartAltIcon />}
  onClick={resetLayout}
  disabled={pendingWidgetIds.length > 0}
>
  Ripristina layout
</Button>

<Snackbar
  open={Boolean(notice)}
  autoHideDuration={4000}
  onClose={clearNotice}
  message={notice?.message}
/>
```

Il file finale della pagina nel TODO 10 mostra queste parti nel loro contesto completo.

### Verifica manuale

1. Modifica `Criticità aperte` in `Criticità rollback`.
2. Salva.
3. Osserva il titolo ottimistico e la progress bar.
4. Attendi l'errore.

Il titolo iniziale deve tornare senza ricaricare la pagina.

### Errori comuni

- Ripristinare l'intero array da una copia vecchia.
- Eseguire la mutazione dentro un Effect.
- Lasciare il widget in stato pending dopo un errore.
- Salvare lo stato ottimistico come risposta canonica della API.

### Checkpoint

- [ ] La UI cambia prima della risposta.
- [ ] Il rollback ripristina il widget corretto.
- [ ] Commit e rollback rimuovono pending.
- [ ] Il reset non può interferire con un salvataggio pending.
- [ ] La Snackbar comunica l'esito.

---

## TODO 10: chiudi i confini e completa la mappa

### Obiettivo

Verifica dipendenze, comportamento e motivazioni. La code review deve usare esempi del codice.

### Cosa devi fare

Questo TODO non aggiunge un altro pattern. Completa l'estrazione del componente iniziale, controlla che ogni file possieda una sola responsabilità e collega le decisioni alla mappa.

1. Rinomina il componente di pagina in `DashboardPage` e spostalo in `src/dashboard/components/DashboardPage.tsx`.
2. Estrai `WidgetCard`. Passagli widget, posizione, stato pending, snapshot e callback delle azioni. Il componente non deve leggere storage o chiamare servizi.
3. Estrai `WidgetContent`. Mantieni qui i calcoli specifici del contenuto: totale dei consumi, valore massimo e occupazione media.
4. Sposta le fixture in `src/dashboard/services/operations.fixture.ts`. Solo il servizio simulato deve importarle.
5. Elimina il vecchio `OperationsDashboard.tsx` dopo aver spostato tutte le responsabilità. Aggiorna o sostituisci il relativo test.
6. Aggiorna `App.tsx` per comporre soltanto `DashboardProvider` e `DashboardPage`.
7. Apri `mappa-decisionale-stato-studente.md` e completa ogni riga con simboli e percorsi reali della soluzione.
8. Per ogni `useState`, scrivi perché il valore vive in quel componente.
9. Per ogni `useEffect`, identifica la risorsa esterna sincronizzata. Devono restare Effect per API e storage, non per derived state o click.
10. Esegui le ricerche automatiche, i test e la prova manuale degli scenari.

### Come controllare i confini

Leggi gli import di ogni cartella:

- `components` può importare tipi, hook e azioni della feature;
- `hooks` può importare il contratto API, ma non Material UI;
- `state` può importare tipi e contratto API, ma il reducer non importa il servizio;
- `services` può importare fixture e tipi, ma non componenti React.

Se un file importa un livello che non gli serve, torna al punto in cui hai assegnato il proprietario.

### Risultato del TODO

La struttura finale rende visibili quattro confini: rendering, ciclo React della richiesta, transizioni client e accesso ai dati. La mappa documenta le stesse scelte con esempi del progetto.

### Codice da scrivere e stato finale dei file

Questo checkpoint sostituisce il vecchio `OperationsDashboard.tsx`. Crea i tre componenti, aggiorna `App`, poi elimina il vecchio file soltanto quando import e test usano la nuova struttura.

<details>
<summary>Apri WidgetContent.tsx completo</summary>

`src/dashboard/components/WidgetContent.tsx`

```tsx
/** WidgetContent trasforma lo snapshot in quattro viste presentazionali. */
import GroupsIcon from '@mui/icons-material/Groups';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {
  DashboardWidget,
  OperationsSnapshot,
} from '../dashboard.types';

const healthLabels = {
  regolare: 'Regolare',
  attenzione: 'Attenzione',
  critica: 'Critica',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('it-IT').format(value);
}

export function WidgetContent({
  widget,
  snapshot,
}: {
  widget: DashboardWidget;
  snapshot: OperationsSnapshot;
}) {
  if (widget.kind === 'alerts') {
    return (
      <Stack spacing={1.5}>
        <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
          {snapshot.alerts.length}
        </Typography>
        <Typography color="text.secondary">segnalazioni da gestire</Typography>
        <List dense disablePadding aria-label="Ultime criticità">
          {snapshot.alerts.slice(0, 2).map((alert) => (
            <ListItem key={alert.id} disableGutters>
              <ListItemText
                primary={alert.title}
                secondary={alert.severity === 'alta' ? 'Priorità alta' : 'Priorità media'}
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  }

  if (widget.kind === 'sites') {
    return (
      <List disablePadding aria-label="Stato delle sedi">
        {snapshot.sites.map((site) => (
          <ListItem
            key={site.id}
            disableGutters
            secondaryAction={
              <Chip
                size="small"
                label={healthLabels[site.health]}
                color={
                  site.health === 'critica'
                    ? 'error'
                    : site.health === 'attenzione'
                      ? 'warning'
                      : 'default'
                }
              />
            }
          >
            <ListItemText primary={site.name} secondary={site.city} />
          </ListItem>
        ))}
      </List>
    );
  }

  if (widget.kind === 'energy') {
    const total = snapshot.sites.reduce((sum, site) => sum + site.energyKwh, 0);
    const max = Math.max(...snapshot.sites.map((site) => site.energyKwh), 1);
    return (
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 700 }}>
            {formatNumber(total)} kWh
          </Typography>
          <Typography color="text.secondary">totale delle sedi</Typography>
        </Box>
        {snapshot.sites.map((site) => (
          <Box key={site.id}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">{site.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatNumber(site.energyKwh)} kWh
              </Typography>
            </Stack>
            <LinearProgress
              aria-label={`Consumo ${site.name}`}
              variant="determinate"
              value={(site.energyKwh / max) * 100}
              sx={{ mt: 0.75, height: 7, borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

  const average = Math.round(
    snapshot.sites.reduce((sum, site) => sum + site.occupancy, 0) /
      Math.max(snapshot.sites.length, 1),
  );
  return (
    <Stack spacing={2}>
      <GroupsIcon color="primary" sx={{ fontSize: 32 }} aria-hidden="true" />
      <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
        {average}%
      </Typography>
      <Typography color="text.secondary">media sulle sedi attive</Typography>
      <LinearProgress
        aria-label="Occupazione media"
        variant="determinate"
        value={average}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Stack>
  );
}
```

</details>

<details>
<summary>Apri WidgetCard.tsx completo</summary>

`src/dashboard/components/WidgetCard.tsx`

```tsx
/** La card riceve dati e callback. Non conosce Context, reducer o API. */
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { DashboardWidget, OperationsSnapshot } from '../dashboard.types';
import { WidgetContent } from './WidgetContent';

const kindLabels = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

type WidgetCardProps = {
  widget: DashboardWidget;
  snapshot: OperationsSnapshot;
  pending: boolean;
  canMoveBefore: boolean;
  canMoveAfter: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function WidgetCard({
  widget,
  snapshot,
  pending,
  canMoveBefore,
  canMoveAfter,
  onMove,
  onEdit,
  onDelete,
}: WidgetCardProps) {
  return (
    <Card
      component="article"
      variant="outlined"
      aria-busy={pending}
      sx={{
        gridColumn: { lg: widget.size === 'wide' ? 'span 2' : 'span 1' },
        minWidth: 0,
        position: 'relative',
      }}
    >
      {pending ? <LinearProgress aria-label={`Salvataggio ${widget.title}`} /> : null}
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: 'flex-start', mb: 2.5 }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography component="h2" variant="h2">
              {widget.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {kindLabels[widget.kind]}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={0.25}
            sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
          >
            <Tooltip title="Sposta prima">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Sposta prima ${widget.title}`}
                  disabled={!canMoveBefore || pending}
                  onClick={() => onMove(-1)}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Sposta dopo">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Sposta dopo ${widget.title}`}
                  disabled={!canMoveAfter || pending}
                  onClick={() => onMove(1)}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Modifica">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Modifica ${widget.title}`}
                  disabled={pending}
                  onClick={onEdit}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Elimina">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Elimina ${widget.title}`}
                  disabled={pending}
                  onClick={onDelete}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        <WidgetContent widget={widget} snapshot={snapshot} />
      </CardContent>
    </Card>
  );
}
```

</details>

<details>
<summary>Apri DashboardPage.tsx completo</summary>

`src/dashboard/components/DashboardPage.tsx`

```tsx
/** DashboardPage compone Context, server state e stato locale dei Dialog. */
import { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { DashboardWidget, TimeRange } from '../dashboard.types';
import { useOperationsData } from '../hooks/useOperationsData';
import {
  useDashboardActions,
  useDashboardState,
  useOperationsApi,
} from '../state/DashboardContext';
import { WidgetCard } from './WidgetCard';
import { WidgetEditorDialog } from './WidgetEditorDialog';

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; widget: DashboardWidget }
  | null;

const kindLabels = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

export function DashboardPage() {
  const { widgets, range, pendingWidgetIds, notice } = useDashboardState();
  const {
    setRange,
    saveWidget,
    removeWidget,
    moveWidget,
    resetLayout,
    clearNotice,
  } = useDashboardActions();
  const api = useOperationsApi();
  const operations = useOperationsData(api, range);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorState>(null);
  const [widgetToDelete, setWidgetToDelete] =
    useState<DashboardWidget | null>(null);
  const createWidgetButtonRef = useRef<HTMLButtonElement>(null);
  const focusCreateAfterDelete = useRef(false);

  // Ricerca e conteggio derivano da stato globale e input locale.
  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');
  const visibleWidgets = widgets.filter((widget) =>
    [widget.title, kindLabels[widget.kind]]
      .join(' ')
      .toLocaleLowerCase('it-IT')
      .includes(normalizedQuery),
  );

  function handleSave(widget: DashboardWidget) {
    setEditor(null);
    void saveWidget(widget);
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <DashboardCustomizeIcon aria-hidden="true" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>Centrale Operativa</Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              Monitoraggio sedi aziendali
            </Typography>
          </Box>
          <Chip
            label="Ambiente didattico"
            size="small"
            sx={{
              color: 'grey.100',
              borderColor: 'grey.600',
              display: { xs: 'none', sm: 'flex' },
            }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {operations.isRefreshing ? (
        <LinearProgress aria-label="Aggiornamento dati" />
      ) : null}

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-end' },
            mb: 4,
          }}
        >
          <Box>
            <Typography component="h1" variant="h1">
              Dashboard a widget
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              Componi la vista operativa, controlla le sedi e intervieni sulle
              criticità senza perdere il contesto.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="range-label">Intervallo</InputLabel>
              <Select
                labelId="range-label"
                label="Intervallo"
                value={range}
                onChange={(event) => setRange(event.target.value as TimeRange)}
              >
                <MenuItem value="oggi">Oggi</MenuItem>
                <MenuItem value="7-giorni">Ultimi 7 giorni</MenuItem>
                <MenuItem value="30-giorni">Ultimi 30 giorni</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={operations.refresh}
            >
              Aggiorna dati
            </Button>
            <Button
              ref={createWidgetButtonRef}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setEditor({ mode: 'create' })}
            >
              Crea widget
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <TextField
              label="Cerca widget"
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ flexGrow: 1, maxWidth: { sm: 420 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon aria-hidden="true" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography color="text.secondary" aria-live="polite">
              {`${visibleWidgets.length} ${
                visibleWidgets.length === 1 ? 'widget visibile' : 'widget visibili'
              }`}
            </Typography>
            <Button
              startIcon={<RestartAltIcon />}
              onClick={resetLayout}
              disabled={pendingWidgetIds.length > 0}
            >
              Ripristina layout
            </Button>
          </Stack>
        </Paper>

        {operations.status === 'loading' && !operations.data ? (
          <Box
            role="status"
            aria-label="Caricamento dashboard"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={220} />
            ))}
          </Box>
        ) : null}

        {operations.status === 'error' ? (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{ mb: operations.data ? 2 : 0 }}
            action={
              <Button color="inherit" onClick={operations.retry}>
                Riprova
              </Button>
            }
          >
            <Typography sx={{ fontWeight: 700 }}>Dati non disponibili</Typography>
            {operations.error}
          </Alert>
        ) : null}

        {operations.status === 'empty' ? (
          <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
            <BusinessIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
            <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
              Nessuna sede disponibile
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aggiorna i dati oppure verifica la sorgente API.
            </Typography>
          </Paper>
        ) : null}

        {operations.data && operations.data.sites.length > 0 ? (
          widgets.length === 0 ? (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <DashboardCustomizeIcon
                color="primary"
                sx={{ fontSize: 40 }}
                aria-hidden="true"
              />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget configurato
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setEditor({ mode: 'create' })}>
                Crea il primo widget
              </Button>
            </Paper>
          ) : visibleWidgets.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {visibleWidgets.map((widget) => {
                const position = widgets.findIndex((item) => item.id === widget.id);
                return (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    snapshot={operations.data!}
                    pending={pendingWidgetIds.includes(widget.id)}
                    canMoveBefore={position > 0}
                    canMoveAfter={position < widgets.length - 1}
                    onMove={(direction) => moveWidget(widget.id, direction)}
                    onEdit={() => setEditor({ mode: 'edit', widget })}
                    onDelete={() => setWidgetToDelete(widget)}
                  />
                );
              })}
            </Box>
          ) : (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <SearchIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget corrisponde alla ricerca
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setQuery('')}>
                Reimposta ricerca
              </Button>
            </Paper>
          )
        ) : null}

        {operations.data ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 3 }}
          >
            Dati aggiornati il{' '}
            {new Intl.DateTimeFormat('it-IT', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(operations.data.updatedAt))}
          </Typography>
        ) : null}
      </Container>

      {editor ? (
        <WidgetEditorDialog
          widget={editor.mode === 'edit' ? editor.widget : undefined}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      ) : null}

      <Dialog
        open={Boolean(widgetToDelete)}
        onClose={() => setWidgetToDelete(null)}
        slotProps={{
          transition: {
            onExited: () => {
              if (!focusCreateAfterDelete.current) return;
              focusCreateAfterDelete.current = false;
              createWidgetButtonRef.current?.focus();
            },
          },
        }}
      >
        <DialogTitle>Eliminare il widget?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {widgetToDelete
              ? `Il widget "${widgetToDelete.title}" verrà rimosso dalla dashboard.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetToDelete(null)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (widgetToDelete) {
                focusCreateAfterDelete.current = true;
                removeWidget(widgetToDelete.id);
              }
              setWidgetToDelete(null);
            }}
          >
            Elimina widget
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={clearNotice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notice ? (
          <Alert severity={notice.severity} onClose={clearNotice} variant="filled">
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
```

</details>

<details>
<summary>Apri App.tsx completo</summary>

`src/App.tsx`

```tsx
/** App compone provider e pagina senza esporre i dettagli del reducer. */
import { DashboardPage } from './dashboard/components/DashboardPage';
import type { OperationsApi } from './dashboard/services/OperationsApi';
import { DashboardProvider } from './dashboard/state/DashboardContext';

export function App({ api }: { api?: OperationsApi }) {
  return (
    <DashboardProvider api={api}>
      <DashboardPage />
    </DashboardProvider>
  );
}
```

</details>

<details>
<summary>Apri App.test.tsx completo</summary>

`src/App.test.tsx`

```tsx
/** I test di integrazione verificano flussi utente, Context e rollback. */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import type {
  DashboardWidget,
  OperationsSnapshot,
} from './dashboard/dashboard.types';
import type { OperationsApi } from './dashboard/services/OperationsApi';
import { dashboardStorageKey } from './dashboard/state/dashboardStorage';
import { App } from './App';
import { appTheme } from './theme';

const snapshot: OperationsSnapshot = {
  sites: [
    {
      id: 'site-test',
      name: 'Sede Test',
      city: 'Torino',
      health: 'regolare',
      energyKwh: 420,
      occupancy: 68,
    },
  ],
  alerts: [
    {
      id: 'alert-test',
      siteId: 'site-test',
      title: 'Verifica impianto',
      severity: 'media',
    },
  ],
  updatedAt: '2026-07-23T08:30:00.000Z',
};

function createApi(
  saveWidget: OperationsApi['saveWidget'] = async (widget) => widget,
): OperationsApi {
  return {
    getSnapshot: async () => snapshot,
    saveWidget,
    invalidate: () => undefined,
  };
}

function renderApp(api = createApi()) {
  return render(
    <ThemeProvider theme={appTheme}>
      <App api={api} />
    </ThemeProvider>,
  );
}

describe('Widget dashboard soluzione', () => {
  it('carica i dati e filtra una lista derivata', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.type(screen.getByLabelText('Cerca widget'), 'consumi');

    expect(screen.getByRole('heading', { name: 'Consumi energetici' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Criticità aperte' })).not.toBeInTheDocument();
    expect(screen.getByText('1 widget visibile')).toBeInTheDocument();
  });

  it('crea un widget con aggiornamento ottimistico', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    await user.type(await screen.findByLabelText('Titolo'), 'Presidio serale');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));

    expect(screen.getByRole('heading', { name: 'Presidio serale' })).toBeInTheDocument();
    expect(await screen.findByText('Widget salvato.')).toBeInTheDocument();
  });

  it('cerca anche tramite l\'etichetta italiana del tipo', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await user.click(screen.getByRole('button', { name: 'Modifica Criticità aperte' }));
    await user.clear(await screen.findByLabelText('Titolo'));
    await user.type(screen.getByLabelText('Titolo'), 'Segnalazioni prioritarie');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    await screen.findByRole('heading', { name: 'Segnalazioni prioritarie' });

    await user.type(screen.getByLabelText('Cerca widget'), 'criticità');

    expect(
      screen.getByRole('heading', { name: 'Segnalazioni prioritarie' }),
    ).toBeInTheDocument();
  });

  it('ripristina il widget precedente dopo un errore di salvataggio', async () => {
    let rejectSave: ((reason: Error) => void) | undefined;
    const pendingSave = new Promise<DashboardWidget>((_resolve, reject) => {
      rejectSave = reject;
    });
    const user = userEvent.setup();
    renderApp(createApi(() => pendingSave));
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Modifica Criticità aperte' }));
    await user.clear(await screen.findByLabelText('Titolo'));
    await user.type(screen.getByLabelText('Titolo'), 'Titolo temporaneo');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    expect(screen.getByRole('heading', { name: 'Titolo temporaneo' })).toBeInTheDocument();

    await act(async () => rejectSave?.(new Error('Salvataggio rifiutato.')));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Criticità aperte' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Salvataggio rifiutato.')).toBeInTheDocument();
  });

  it('persiste il widget soltanto dopo il commit della API', async () => {
    let resolveSave!: (widget: DashboardWidget) => void;
    let submittedWidget: DashboardWidget | undefined;
    const pendingSave = new Promise<DashboardWidget>((resolve) => {
      resolveSave = resolve;
    });
    const user = userEvent.setup();
    renderApp(
      createApi((widget) => {
        submittedWidget = widget;
        return pendingSave;
      }),
    );
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await waitFor(() =>
      expect(window.localStorage.getItem(dashboardStorageKey)).not.toBeNull(),
    );

    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    await user.type(await screen.findByLabelText('Titolo'), 'Presidio serale');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));

    expect(screen.getByRole('heading', { name: 'Presidio serale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ripristina layout' })).toBeDisabled();
    expect(window.localStorage.getItem(dashboardStorageKey)).not.toContain(
      'Presidio serale',
    );

    await act(async () =>
      resolveSave({ ...submittedWidget!, title: 'Presidio confermato' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Presidio confermato' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem(dashboardStorageKey)).toContain(
        'Presidio confermato',
      ),
    );
    expect(screen.getByRole('button', { name: 'Ripristina layout' })).toBeEnabled();
  });

  it('mostra empty state quando la API non restituisce sedi', async () => {
    renderApp({
      ...createApi(),
      getSnapshot: async () => ({ ...snapshot, sites: [], alerts: [] }),
    });

    expect(
      await screen.findByRole('heading', { name: 'Nessuna sede disponibile' }),
    ).toBeInTheDocument();
  });

  it('recupera da un errore con il retry', async () => {
    let requests = 0;
    const user = userEvent.setup();
    renderApp({
      ...createApi(),
      getSnapshot: async () => {
        requests += 1;
        if (requests === 1) throw new Error('Servizio non disponibile');
        return snapshot;
      },
    });
    expect(await screen.findByText('Servizio non disponibile')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Riprova' }));

    expect(
      await screen.findByRole('heading', { name: 'Criticità aperte' }),
    ).toBeInTheDocument();
  });

  it('sposta il focus su Crea widget dopo una eliminazione', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Elimina Criticità aperte' }));
    await user.click(screen.getByRole('button', { name: 'Elimina widget' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Crea widget' })).toHaveFocus(),
    );
  });

  it('salva il Dialog con Invio', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    const title = await screen.findByLabelText('Titolo');
    await user.type(title, 'Presidio tastiera{Enter}');

    expect(
      await screen.findByRole('heading', { name: 'Presidio tastiera' }),
    ).toBeInTheDocument();
  });
});
```

</details>

Dopo aver creato i file:

1. rimuovi l'import di `OperationsDashboard` da `App.tsx`;
2. verifica che nessun file importi ancora `./dashboard/operationsApi`;
3. elimina `src/dashboard/OperationsDashboard.tsx`, `OperationsDashboard.test.tsx` e `operationsApi.ts`;
4. esegui `npm run check`;
5. confronta l'albero ottenuto con la struttura finale seguente.

### Struttura finale

```text
src/
├── App.tsx
├── main.tsx
├── theme.ts
├── dashboard/
│   ├── components/
│   │   ├── DashboardPage.tsx
│   │   ├── WidgetCard.tsx
│   │   ├── WidgetContent.tsx
│   │   └── WidgetEditorDialog.tsx
│   ├── hooks/
│   │   ├── useOperationsData.ts
│   │   └── useOperationsData.test.tsx
│   ├── services/
│   │   ├── OperationsApi.ts
│   │   ├── createSimulatedOperationsApi.ts
│   │   └── operations.fixture.ts
│   ├── state/
│   │   ├── DashboardContext.tsx
│   │   ├── dashboardReducer.ts
│   │   ├── dashboardReducer.test.ts
│   │   └── dashboardStorage.ts
│   └── dashboard.types.ts
└── test/
    └── setup.ts
```

### Verifiche automatiche

```bash
rg "useEffect" src/dashboard
rg "localStorage" src/dashboard/components src/dashboard/hooks
rg "operations.fixture" src/dashboard/components
npm run check
```

La prima ricerca deve trovare sincronizzazione con API o storage. Le due ricerche successive non devono trovare dipendenze nei componenti.

### Code review finale

Rispondi usando percorsi e simboli reali:

1. Perché il draft resta locale?
2. Perché `visibleWidgets` è derived state?
3. Perché il reducer non chiama `saveWidget`?
4. Perché la cache vive nel servizio?
5. Perché l'Effect possiede un `AbortController`?
6. Perché stato e azioni usano Context separati?
7. Quale dato non deve entrare in `localStorage`?
8. Quale snapshot consente il rollback?

### Checklist finale

- [ ] La mappa decisionale contiene esempi del progetto.
- [ ] La dashboard funziona a 390, 768 e 1440 pixel.
- [ ] Tutti i pulsanti icona possiedono un nome accessibile.
- [ ] Loading, error, empty, retry e refresh sono verificabili.
- [ ] Una richiesta obsoleta non aggiorna la UI.
- [ ] Lo storage corrotto usa il fallback.
- [ ] Il rollback ripristina il widget precedente.
- [ ] `npm run check` termina senza warning o errori.

## Estensione facoltativa

Aggiungi un widget `Manutenzioni in scadenza`.

Definisci prima:

- dati richiesti e query key;
- stato locale, globale, derivato e server coinvolto;
- loading, empty state ed errore;
- strategia di invalidazione dopo una manutenzione completata.

Non aggiungere una nuova libreria di stato. Usa i confini esistenti e aggiorna la mappa decisionale.
