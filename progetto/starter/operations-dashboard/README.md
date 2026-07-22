# Operations Dashboard, starter del Modulo 1

Questo progetto accompagna il laboratorio di architettura React. La dashboard parte con una struttura intenzionalmente accentrata: il comportamento funziona, i test sono verdi e il brief guida la separazione delle responsabilità.

## Requisiti

- Node.js 22.13 o successivo. La versione consigliata è indicata in `.nvmrc`.
- npm 10 o successivo.

## Primo avvio

```bash
cd progetto/starter/operations-dashboard
nvm use
npm ci
npm run dev
```

Apri l'indirizzo mostrato da Vite. Non servono variabili ambiente, account o servizi esterni.

## Comandi

| Comando | Uso |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo. |
| `npm run test` | Esegue i test una volta. |
| `npm run test:watch` | Riesegue i test dopo ogni modifica. |
| `npm run lint` | Controlla regole statiche e uso degli Hook. |
| `npm run build` | Controlla i tipi e crea la build. |
| `npm run check` | Esegue lint, test e build in sequenza. |

## Punto di partenza

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

`OperationsDashboard.tsx` gestisce stato, filtri, dati derivati e rendering. Questa concentrazione fornisce il materiale da rifattorizzare. I test descrivono il comportamento da conservare.

## Percorso

1. Leggi il [brief del laboratorio](../../documentazione/brief-modulo-1.md).
2. Completa un TODO alla volta.
3. Prova il comportamento indicato nel checkpoint.
4. Esegui `npm run check` prima di passare al TODO successivo.
5. Compila la [checklist architetturale](../../documentazione/checklist-architetturale.md).
