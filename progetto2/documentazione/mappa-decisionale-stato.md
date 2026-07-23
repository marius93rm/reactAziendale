# Mappa decisionale dello stato

Usa questa mappa prima di aggiungere un nuovo `useState`, un Context o un Effect. Scrivi il proprietario del valore prima di scegliere lo strumento.

## Percorso decisionale

```text
Il valore arriva da una API o da un backend?
  Sì -> server state
        servizio API + custom hook
        loading, error, retry, cache e invalidazione
  No -> puoi calcolarlo da dati e stato già disponibili?
        Sì -> derived state
              calcolo durante il render o selector puro
        No -> serve a un solo componente o a un sottalbero vicino?
              Sì -> stato locale con useState
              No -> più rami distanti devono leggerlo o modificarlo?
                    Sì -> stato condiviso
                          solleva lo stato o usa Context
                    No -> mantienilo nel proprietario più vicino

Il valore deve sopravvivere al reload?
  Sì -> persistent state
        storage versionato, validazione e fallback

Le transizioni coinvolgono più campi, operazioni pending o rollback?
  Sì -> useReducer con azioni di dominio
```

Context trasporta un valore. Non trasforma uno stato locale in server state. `useReducer` descrive transizioni. Non rende uno stato globale.

## Mappa della soluzione

| Valore | Categoria | Proprietario | Strumento |
| --- | --- | --- | --- |
| Dialog aperto | UI state locale | `DashboardPage` | `useState` |
| Draft del widget | Stato locale | `WidgetEditorDialog` | `useState` |
| Testo di ricerca | Stato locale | `DashboardPage` | `useState` |
| Intervallo | Stato globale persistente | `DashboardProvider` | Context e reducer |
| Configurazione widget | Stato globale persistente | `DashboardProvider` | Context e reducer |
| Widget in salvataggio | Stato di mutazione globale | `DashboardProvider` | reducer |
| Dati delle sedi | Server state | `useOperationsData` | `useState` e `useEffect` |
| Stato della richiesta | Server state | `useOperationsData` | stato discriminato |
| Widget visibili | Derived state | `DashboardPage` | `filter` durante il render |
| Consumo totale | Derived state | `WidgetContent` | `reduce` durante il render |
| Occupazione media | Derived state | `WidgetContent` | `reduce` durante il render |
| Cache per intervallo | Server state infrastrutturale | `createSimulatedOperationsApi` | `Map` con TTL |
| Snackbar | UI state temporaneo | `DashboardProvider` | reducer |

## Scheda da compilare

| Valore | Sorgente | Chi legge | Chi modifica | Sopravvive al reload | Categoria | Proprietario |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Controlli per la code review

- [ ] Ogni valore possiede un solo proprietario riconoscibile.
- [ ] I dati derivati non possiedono setter.
- [ ] Un Effect sincronizza React con API, timer o storage.
- [ ] Un click avvia la propria mutazione senza passare da un Effect.
- [ ] Il reducer non legge storage e non chiama servizi.
- [ ] Il Context non contiene draft del form o dati usati da un solo componente.
- [ ] Lo storage non contiene loading, errori, cache o operazioni pending.
- [ ] Lo storage non contiene modifiche ottimistiche ancora pending.
- [ ] Il server state gestisce abort, error e retry.
