<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=250&color=0:0B2545,100:2563EB&text=React%20Aziendale&fontColor=F8FAFC&fontSize=54&fontAlignY=38&desc=Corso%20intermedio%20e%20avanzato%20in%2020%20ore&descAlignY=58" width="100%" alt="React Aziendale, corso intermedio e avanzato in 20 ore" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-intermedio%20%2F%20avanzato-2563EB?style=for-the-badge&logo=react&logoColor=white" alt="Livello React intermedio e avanzato" />
  <img src="https://img.shields.io/badge/durata-20%20ore-0B2545?style=for-the-badge&logo=clockify&logoColor=white" alt="Durata 20 ore" />
  <img src="https://img.shields.io/badge/formato-laboratorio-2563EB?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Formato laboratorio" />
  <img src="https://img.shields.io/badge/stato-in%20preparazione-0B2545?style=for-the-badge&logo=github&logoColor=white" alt="Contenuti in preparazione" />
</p>

<p align="center">
  Materiali, esercizi e project work del corso aziendale React.js per due partecipanti.
</p>

> [!NOTE]
> La struttura è pronta. Il team aggiungerà slide, esempi ed esercizi durante la preparazione del corso.

## 🧭 Indice

- [🎯 Il corso](#il-corso)
- [🧰 Prerequisiti](#prerequisiti)
- [🗓️ Programma](#programma)
  - [Modulo 1: Architettura React moderna](#modulo-1)
  - [Modulo 2: State management avanzato](#modulo-2)
  - [Modulo 3: Performance, rendering e scalabilità](#modulo-3)
  - [Modulo 4: Form enterprise, UX e accessibilità](#modulo-4)
  - [Modulo 5: Testing, qualità e rilascio](#modulo-5)
- [🏗️ Project work](#project-work)
- [🗂️ Struttura della repository](#struttura)
- [🧪 Metodo di lavoro](#metodo)
- [📚 Documenti](#documenti)

<a id="il-corso"></a>

## 🎯 Il corso

Il percorso porta sviluppatori con esperienza React verso un metodo adatto a progetti aziendali: architettura frontend, stato, performance, form complessi, test e rilascio.

| Voce | Dettaglio |
| --- | --- |
| Durata | 20 ore |
| Partecipanti | 2 persone |
| Livello in ingresso | Intermedio |
| Formato consigliato | 5 incontri da 4 ore oppure 10 incontri da 2 ore |
| Approccio | Spiegazione tecnica, laboratorio, code review e project work |

Al termine del corso i partecipanti sapranno:

- progettare componenti riutilizzabili e manutenibili;
- distinguere client state, server state, derived state e UI state;
- usare custom hook, reducer e context con confini chiari;
- misurare e ridurre re-render e costi di caricamento;
- costruire form accessibili con validazione ed error handling;
- scrivere test utili e preparare il codice per review, build e deploy.

<a id="prerequisiti"></a>

## 🧰 Prerequisiti

- JavaScript moderno: moduli, destructuring, Promise e `async/await`.
- Componenti funzionali e hook React come `useState`, `useEffect` e `useRef`.
- Routing, chiamate HTTP e dati provenienti da API.
- Git, Node.js, npm o pnpm e un editor di codice.
- CSS di base oppure esperienza con una libreria UI.

<a id="programma"></a>

## 🗓️ Programma

Il corso comprende cinque moduli da quattro ore. Ogni modulo produce un risultato concreto che confluisce nel progetto finale.

<a id="modulo-1"></a>

### Modulo 1: Architettura React moderna

**Durata:** 4 ore
**Focus:** component design, custom hook e struttura del progetto

Contenuti:

- ripasso dei concetti React usati nei progetti complessi;
- component composition e criteri di scomposizione;
- componenti presentazionali, container e separazione tra logica e interfaccia;
- custom hook per logica di dominio, effetti e accesso ai dati;
- riduzione del prop drilling e gestione delle dipendenze;
- struttura feature-based con `shared`, `services`, `hooks` e `utils`;
- naming convention e standard leggibili dal team.

**Esercitazione:** refactoring di una sezione applicativa, da componenti monolitici a moduli con hook dedicati e componenti riutilizzabili.

**Output:** checklist architetturale per valutare componenti e cartelle di un progetto React.

<a id="modulo-2"></a>

### Modulo 2: State management avanzato

**Durata:** 4 ore
**Focus:** client state, server state, cache e reducer

Contenuti:

- stato locale, globale, derivato, persistente e server state;
- Context API, suddivisione dei contesti e controllo dei render;
- `useReducer` per transizioni esplicite e prevedibili;
- loading, error, empty state, retry e aggiornamenti asincroni;
- separazione tra accesso API, trasformazione dei dati e rendering;
- caching, invalidazione, refresh e sincronizzazione con il backend;
- optimistic update e rollback.

**Esercitazione:** dashboard con filtri, lista dati, API simulate, aggiornamento ottimistico e gestione degli stati di interfaccia.

**Output:** mappa decisionale per scegliere dove collocare lo stato e come strutturare i reducer.

<a id="modulo-3"></a>

### Modulo 3: Performance, rendering e scalabilità

**Durata:** 4 ore
**Focus:** profiling, memoizzazione e code splitting

Contenuti:

- rendering e re-render in React;
- props instabili, context ampi e calcoli pesanti;
- uso di `React.memo`, `useMemo` e `useCallback`;
- costi e anti-pattern della memoizzazione;
- lazy loading e code splitting per area funzionale;
- Suspense e caricamento progressivo;
- virtualizzazione di liste e tabelle;
- analisi con React DevTools Profiler.

**Esercitazione:** profiling di una pagina lenta, ricerca dei colli di bottiglia e verifica delle ottimizzazioni.

**Output:** report prima e dopo con motivazione tecnica degli interventi.

<a id="modulo-4"></a>

### Modulo 4: Form enterprise, UX e accessibilità

**Durata:** 4 ore
**Focus:** form complessi, validazione, accessibilità e ruoli

Contenuti:

- pattern per form semplici, complessi e multi-step;
- input controllati e non controllati;
- validazione client-side e messaggi di errore;
- submit asincroni, salvataggio parziale e prevenzione del doppio invio;
- tabelle, modali, wizard, tab e filtri avanzati;
- label, focus management, tastiera e stati ARIA essenziali;
- visibilità, abilitazione e protezione delle azioni in base al ruolo.

**Esercitazione:** form aziendale multi-step con validazione, riepilogo, gestione errori e interfaccia basata sul ruolo.

**Output:** template di form riusabile con schema di validazione e UX coerente.

<a id="modulo-5"></a>

### Modulo 5: Testing, qualità e rilascio

**Durata:** 4 ore
**Focus:** test, code review, build e project work

Contenuti:

- strategia di test e priorità nei progetti aziendali;
- unit test su funzioni, hook e componenti isolati;
- integration test sui flussi utente;
- code review di naming, responsabilità e rischi architetturali;
- build di produzione, variabili ambiente e configurazioni;
- transizioni, stato ottimistico e operazioni asincrone;
- revisione tecnica del project work.

**Esercitazione:** completamento di una mini-app con routing, gestione dati, form, ottimizzazioni e test essenziali.

**Output:** mini progetto dimostrativo e checklist di rilascio frontend.

<a id="project-work"></a>

## 🏗️ Project work

I partecipanti costruiscono una mini applicazione aziendale lungo tutto il corso. Il progetto comprende:

- routing tra dashboard, dettaglio e modifica dei record;
- component library interna con bottoni, campi, messaggi di stato e layout;
- servizio dati con loading, error, retry ed empty state;
- form multi-step con validazione e salvataggio controllato;
- ruoli semplificati per mostrare o disabilitare azioni;
- ottimizzazioni di rendering e caricamento;
- test su hook, componenti e flussi principali.

Lo starter, la soluzione e la guida del Modulo 1 vivono in
[`progetto/`](progetto/README.md). Il laboratorio sullo state management del
Modulo 2 vive in [`progetto2/`](progetto2/README.md). Il laboratorio
complementare su `useEffect`, Context e API pubbliche vive in
[`progetto2bis/`](progetto2bis/README.md).

<a id="struttura"></a>

## 🗂️ Struttura della repository

```text
.
├── docs/
│   └── programma.md
├── materiali/
│   ├── slides/
│   │   ├── 01-architettura-react/
│   │   └── 02-state-management-avanzato/
│   └── pdf/
│       └── programma-react-aziendale-20h.pdf
├── progetto/
│   ├── starter/
│   │   └── operations-dashboard/
│   ├── soluzione/
│   │   └── operations-dashboard/
│   └── documentazione/
│       ├── brief-modulo-1.md
│       └── checklist-architetturale.md
├── progetto2/
│   ├── starter/
│   │   └── widget-dashboard/
│   ├── soluzione/
│   │   └── widget-dashboard/
│   └── documentazione/
│       ├── brief-modulo-2.md
│       ├── mappa-decisionale-stato-studente.md
│       └── mappa-decisionale-stato.md
├── progetto2bis/
│   ├── starter/
│   │   └── meteo-sedi/
│   ├── soluzione/
│   │   └── meteo-sedi/
│   └── documentazione/
│       ├── brief-useeffect-context.md
│       ├── mappa-effect-context-studente.md
│       └── mappa-effect-context.md
└── README.md
```

Slide ed esercizi usano la numerazione `01`-`05`. README e brief collegano ogni laboratorio al modulo corrispondente.

<a id="metodo"></a>

## 🧪 Metodo di lavoro

Ogni incontro segue questo ciclo:

1. **Brief tecnico:** obiettivi, vincoli e punto di partenza.
2. **Dimostrazione:** pattern e implementazioni su esempi concreti.
3. **Laboratorio:** sviluppo assistito sul progetto.
4. **Code review:** scelte tecniche, naming e architettura.
5. **Consolidamento:** checklist, errori emersi e attività successive.

<a id="documenti"></a>

## 📚 Documenti

- [Programma completo in Markdown](docs/programma.md)
- [Programma originale in PDF](materiali/pdf/programma-react-aziendale-20h.pdf)
- [Dashboard guidata del Modulo 1](progetto/README.md)
- [Brief con 10 TODO cumulativi](progetto/documentazione/brief-modulo-1.md)
- [Checklist architetturale](progetto/documentazione/checklist-architetturale.md)
- [Istruzioni dello starter](progetto/starter/operations-dashboard/README.md)
- [Soluzione commentata](progetto/soluzione/operations-dashboard/README.md)
- [Lezione del Modulo 2 sullo state management](materiali/slides/02-state-management-avanzato/secondaLezione.md)
- [Widget Dashboard del Modulo 2](progetto2/README.md)
- [Brief sullo state management](progetto2/documentazione/brief-modulo-2.md)
- [Mappa decisionale da compilare](progetto2/documentazione/mappa-decisionale-stato-studente.md)
- [Mappa decisionale dello stato](progetto2/documentazione/mappa-decisionale-stato.md)
- [Starter Material UI del Modulo 2](progetto2/starter/widget-dashboard/README.md)
- [Soluzione del Modulo 2](progetto2/soluzione/widget-dashboard/README.md)
- [Meteo Sedi, laboratorio complementare del Modulo 2](progetto2bis/README.md)
- [Brief guidato su useEffect e Context](progetto2bis/documentazione/brief-useeffect-context.md)
- [Mappa Effect e Context da compilare](progetto2bis/documentazione/mappa-effect-context-studente.md)
- [Mappa Effect e Context risolta](progetto2bis/documentazione/mappa-effect-context.md)
- [Starter Meteo Sedi](progetto2bis/starter/meteo-sedi/README.md)
- [Soluzione Meteo Sedi](progetto2bis/soluzione/meteo-sedi/README.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=0:0B2545,100:2563EB" width="100%" alt="Separatore grafico finale" />
</p>
