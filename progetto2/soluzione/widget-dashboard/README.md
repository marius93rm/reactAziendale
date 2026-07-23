# Widget Dashboard soluzione

La soluzione separa configurazione client, server state e stato locale dei controlli. Material UI fornisce componenti, tema e icone.

## Avvio

```bash
nvm use
npm ci
npm run dev
```

Se non usi `nvm`, salta `nvm use` e verifica di avere Node.js 22.13 o successivo e npm 10 o successivo.

Chiudi la verifica con:

```bash
npm run check
```

## Confini principali

```text
src/dashboard/
├── components/
│   ├── DashboardPage.tsx
│   ├── WidgetCard.tsx
│   ├── WidgetContent.tsx
│   └── WidgetEditorDialog.tsx
├── hooks/
│   └── useOperationsData.ts
├── services/
│   ├── OperationsApi.ts
│   ├── createSimulatedOperationsApi.ts
│   └── operations.fixture.ts
├── state/
│   ├── DashboardContext.tsx
│   ├── dashboardReducer.ts
│   └── dashboardStorage.ts
└── dashboard.types.ts
```

- `WidgetEditorDialog` possiede il draft locale.
- `DashboardProvider` possiede configurazione e intervallo condivisi.
- `dashboardReducer` gestisce transizioni e rollback senza side effect.
- `useOperationsData` possiede dati, loading, error e refresh.
- `createSimulatedOperationsApi` gestisce latenza, cache TTL e invalidazione.
- Lo storage riceve soltanto configurazioni confermate dalla API.

## Scenari verificabili

- `/?scenario=error-once`: la prima lettura fallisce.
- `/?scenario=empty`: la sorgente restituisce zero sedi.
- `/?scenario=save-error-once`: il primo salvataggio widget fallisce.
- Un titolo che contiene `rollback` forza il rollback della modifica.

La [guida completa](../../documentazione/brief-modulo-2.md) spiega ogni passaggio. La [mappa decisionale risolta](../../documentazione/mappa-decisionale-stato.md) collega ogni valore al suo proprietario. Il [PNG stampabile](../../documentazione/mappa-decisionale-stato.png) contiene la stessa versione con risposte.
