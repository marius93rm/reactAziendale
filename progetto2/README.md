# Laboratorio del Modulo 2

Questo progetto applica lo state management avanzato a una dashboard Material UI. Lo starter funziona al primo avvio e concentra le responsabilità in un componente. Il laboratorio porta lo stesso comportamento verso reducer, Context separati, server state, cache e rollback.

## Materiali

- [Brief guidato con 10 TODO](documentazione/brief-modulo-2.md)
- [Mappa decisionale da compilare](documentazione/mappa-decisionale-stato-studente.md)
- [Mappa decisionale risolta](documentazione/mappa-decisionale-stato.md)
- [Starter della Widget Dashboard](starter/widget-dashboard/README.md)
- [Soluzione commentata](soluzione/widget-dashboard/README.md)

## Obiettivi del laboratorio

Al termine saprai:

- distinguere stato locale, globale, derivato, persistente e server state;
- modellare transizioni con `useReducer`;
- condividere stato e azioni con Context separati;
- caricare dati con `useEffect` e `AbortController`;
- gestire loading, error, empty state, retry e refresh;
- applicare cache, invalidazione, optimistic update e rollback;
- creare, modificare, riordinare ed eliminare widget MUI.

## Avvio rapido

```bash
cd progetto2/starter/widget-dashboard
nvm use
npm ci
npm run dev
```

Se non usi `nvm`, salta `nvm use` e verifica prima le versioni con `node --version` e `npm --version`. Servono Node.js 22.13 o successivo e npm 10 o successivo.

Il progetto non richiede backend, account o variabili ambiente. La API simulata usa fixture locali e supporta gli scenari descritti nel brief.

## Struttura

```text
progetto2/
├── documentazione/
│   ├── brief-modulo-2.md
│   ├── mappa-decisionale-stato-studente.md
│   └── mappa-decisionale-stato.md
├── starter/
│   └── widget-dashboard/
└── soluzione/
    └── widget-dashboard/
```

Il progetto copre il laboratorio e il risultato del Modulo 2 definiti in [`docs/programma.md`](../docs/programma.md).
