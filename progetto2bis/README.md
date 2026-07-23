# Laboratorio del Modulo 2: Meteo Sedi

Meteo Sedi concentra il lavoro su `useEffect` e Context attraverso un'API
pubblica. Lo starter mostra l'interfaccia completa e le quattro sedi, ma non
contiene previsioni simulate né richieste HTTP. Il brief guida
l'implementazione del Context, della persistenza, dell'adapter Open-Meteo e del
custom hook che gestisce il ciclo della richiesta.

## Materiali

- [Brief guidato con 10 TODO](documentazione/brief-useeffect-context.md)
- [Mappa Effect e Context da compilare](documentazione/mappa-effect-context-studente.md)
- [Mappa Effect e Context risolta](documentazione/mappa-effect-context.md)
- [Starter di Meteo Sedi](starter/meteo-sedi/README.md)
- [Soluzione commentata](soluzione/meteo-sedi/README.md)

## Obiettivi del laboratorio

Al termine saprai:

- condividere preferenze con Context senza inserirvi il server state;
- distinguere stato memorizzato, derived state e sincronizzazioni esterne;
- inizializzare e aggiornare `localStorage` in modo difensivo;
- isolare il contratto HTTP dietro un adapter tipizzato;
- validare e trasformare un payload esterno prima del rendering;
- gestire dipendenze, cleanup e risposte obsolete in un Effect;
- mostrare loading, error, empty state, retry e refresh;
- testare i flussi asincroni senza collegarsi alla rete.

## Avvio rapido

```bash
cd progetto2bis/starter/meteo-sedi
nvm use
npm ci
npm run dev
```

Se non usi `nvm`, salta `nvm use`. Controlla prima le versioni con
`node --version` e `npm --version`. Servono Node.js 22.13 o successivo e npm 10
o successivo.

Lo starter non richiede rete durante l'avvio e i test. La soluzione richiede
accesso a `https://api.open-meteo.com` solo per mostrare le previsioni nel
browser. Open-Meteo non richiede account, chiave API o variabili ambiente per
questo uso didattico.

Il servizio gratuito non offre una garanzia di disponibilità. L'app resta
avviabile quando la rete manca e mostra errore e retry. La suite usa dipendenze
iniettate e non chiama il servizio pubblico.

## Struttura

```text
progetto2bis/
├── documentazione/
│   ├── brief-useeffect-context.md
│   ├── mappa-effect-context-studente.md
│   └── mappa-effect-context.md
├── starter/
│   └── meteo-sedi/
└── soluzione/
    └── meteo-sedi/
```

Il progetto integra il laboratorio sullo state management del Modulo 2
descritto in [`docs/programma.md`](../docs/programma.md). Non sostituisce il
project work finale.
