# Programma del corso React.js aziendale

## Scheda del percorso

| Voce | Dettaglio |
| --- | --- |
| Durata | 20 ore |
| Partecipanti | 2 persone |
| Livello | Intermedio in ingresso, avanzato in uscita |
| Formato | 5 incontri da 4 ore oppure 10 incontri da 2 ore |
| Metodo | Spiegazione, laboratorio, code review e project work |

## Obiettivo

Il corso porta i partecipanti verso una padronanza operativa di architettura frontend, gestione dello stato, performance, form enterprise, testing e preparazione al rilascio. Gli esempi riprendono dashboard, aree riservate, flussi autorizzativi, moduli complessi e integrazioni API.

## Destinatari

Il percorso si rivolge a sviluppatori frontend, full stack developer e figure tecniche che usano React in progetti reali e vogliono consolidare un metodo adatto al lavoro in team.

### Prerequisiti

- JavaScript moderno: funzioni, moduli, destructuring, Promise e `async/await`.
- Componenti funzionali React e hook come `useState`, `useEffect` e `useRef`.
- Routing, chiamate HTTP e dati da API.
- Git, Node.js, npm o pnpm e un editor di codice.
- CSS di base o uso di librerie UI.

## Competenze in uscita

- Progettare componenti riutilizzabili, leggibili e manutenibili.
- Distinguere client state, server state, derived state e UI state.
- Usare custom hook, composition, reducer e context con confini chiari.
- Ottimizzare rendering e caricamento tramite profiling, memoizzazione e lazy loading.
- Gestire form complessi, validazione, accessibilità ed error handling.
- Scrivere test mirati e preparare il codice per build, code review e deploy.
- Valutare l'architettura dell'applicazione oltre il singolo componente.

## Moduli

### Modulo 1: Architettura React moderna

**Durata:** 4 ore

#### Contenuti

- Ripasso dei concetti React usati nei progetti complessi.
- Component composition e criteri di scomposizione.
- Componenti presentazionali, container e separazione tra logica e interfaccia.
- Custom hook per logica di dominio, effetti collaterali e accesso ai dati.
- Gestione delle dipendenze e riduzione del prop drilling.
- Struttura feature-based con componenti condivisi, servizi, hook e utility.
- Naming convention e standard di progetto.

#### Laboratorio

Refactoring di una sezione applicativa: da componenti troppo grandi a una struttura modulare con hook dedicati e componenti riutilizzabili.

#### Risultato

Checklist architetturale per valutare componenti e cartelle.

### Modulo 2: State management avanzato

**Durata:** 4 ore

#### Contenuti

- Stato locale, globale, derivato, persistente e server state.
- Context API, suddivisione dei contesti e controllo dei render.
- `useReducer` per logiche prevedibili e transizioni esplicite.
- Loading, error, empty state, retry e aggiornamenti asincroni.
- Separazione tra accesso API, trasformazione dei dati e rendering.
- Caching, invalidazione, refresh e sincronizzazione con il backend.
- Optimistic update e rollback.

#### Laboratorio

Dashboard con filtri, lista dati, chiamate API simulate, aggiornamento ottimistico e gestione degli stati di interfaccia.

#### Risultato

Mappa decisionale per scegliere la collocazione dello stato e la struttura dei reducer.

### Modulo 3: Performance, rendering e scalabilità

**Durata:** 4 ore

#### Contenuti

- Meccanismi di rendering e re-render.
- Props instabili, context ampi e calcoli pesanti.
- `React.memo`, `useMemo` e `useCallback`: benefici, costi e anti-pattern.
- Lazy loading e code splitting per area funzionale.
- Suspense e caricamento progressivo.
- Virtualizzazione di liste e tabelle con molti dati.
- Analisi con React DevTools Profiler.

#### Laboratorio

Profiling di una pagina lenta, ricerca dei colli di bottiglia e applicazione di ottimizzazioni misurabili.

#### Risultato

Report prima e dopo con motivazione tecnica degli interventi.

### Modulo 4: Form enterprise, UX e accessibilità

**Durata:** 4 ore

#### Contenuti

- Pattern per form semplici, complessi e multi-step.
- Input controllati e non controllati.
- Validazione client-side, messaggi di errore e feedback.
- Submit asincroni, salvataggio parziale e prevenzione del doppio invio.
- Tabelle, modali, wizard, tab e filtri avanzati.
- Label, focus management, tastiera e stati ARIA essenziali.
- Visibilità, abilitazione e protezione delle azioni in base al ruolo.

#### Laboratorio

Form aziendale multi-step con validazione, riepilogo, gestione degli errori e interfaccia differenziata per ruolo.

#### Risultato

Template di form riusabile con schema di validazione e UX coerente.

### Modulo 5: Testing, qualità, React avanzato e rilascio

**Durata:** 4 ore

#### Contenuti

- Strategia di test e priorità nei progetti aziendali.
- Unit test su funzioni, hook e componenti isolati.
- Integration test sui flussi utente.
- Code review di naming, responsabilità e rischi architetturali.
- Build di produzione, variabili ambiente e configurazioni.
- Transizioni, stato ottimistico e operazioni asincrone.
- Preparazione del project work e revisione conclusiva.

#### Laboratorio

Completamento di una mini-app con routing, gestione dati, form, ottimizzazioni e test essenziali.

#### Risultato

Mini progetto dimostrativo e checklist di rilascio frontend.

## Project work

I partecipanti costruiscono una mini applicazione aziendale con:

- routing tra dashboard, dettaglio e modifica dei record;
- component library interna;
- servizio dati con loading, error, retry ed empty state;
- form multi-step con validazione e salvataggio controllato;
- ruoli semplificati per mostrare o disabilitare azioni;
- ottimizzazioni di rendering e caricamento;
- test su hook, componenti e flussi principali.

## Metodologia

| Fase | Attività |
| --- | --- |
| Brief tecnico | Il docente analizza livello, strumenti e obiettivi applicativi. |
| Dimostrazione | Il docente mostra pattern su esempi concreti. |
| Laboratorio | I partecipanti implementano funzionalità con il supporto del docente. |
| Code review | Il gruppo valuta scelte tecniche, naming e architettura. |
| Consolidamento | Il gruppo raccoglie errori, checklist e attività successive. |

## Materiali

- Slide tecniche consultabili dopo il corso.
- Repository con esempi, esercizi e project work.
- Checklist di architettura e code review.
- Template per componenti, hook, servizi API e form.
- Ambiente consigliato: Node.js LTS, npm o pnpm, Visual Studio Code e React DevTools.

## Valutazione

Il docente valuta le esercitazioni, il project work e la capacità dei partecipanti di motivare le scelte tecniche. I criteri comprendono:

- scomposizione dei componenti;
- gestione dello stato e dei dati asincroni;
- riduzione dei re-render non necessari;
- esperienza utente nei form e negli stati applicativi;
- test significativi e codice leggibile;
- aderenza alle convenzioni condivise.

## Calendario suggerito

| Incontro | Durata | Argomenti |
| --- | --- | --- |
| 1 | 4 ore | Architettura, component design e custom hook |
| 2 | 4 ore | State management, reducer e server state |
| 3 | 4 ore | Performance, memoizzazione e profiling |
| 4 | 4 ore | Form enterprise, UX, accessibilità e ruoli |
| 5 | 4 ore | Testing, build, project work e revisione |

Fonte: [programma originale in PDF](../materiali/pdf/programma-react-aziendale-20h.pdf).
