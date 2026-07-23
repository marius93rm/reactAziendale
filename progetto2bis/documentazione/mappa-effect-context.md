# Mappa Effect e Context di Meteo Sedi

La mappa collega ogni valore al proprietario e allo strumento usato nella
soluzione. Consultala dopo aver completato il laboratorio.

## Percorso per decidere

```text
Puoi calcolare il valore da props o stato disponibili durante il render?
  Sì -> derived state durante il render
  No -> nasce da un'interazione locale?
        Sì -> stato locale o event handler
        No -> serve a consumer distanti?
              Sì -> Context
              No -> proprietario più vicino

Il valore arriva da un'API?
  Sì -> server state in un custom hook

Devi sincronizzare React con un sistema esterno?
  Sì -> useEffect con dipendenze e cleanup coerenti
```

## Mappa della soluzione

| Valore | Categoria | Proprietario | Strumento | Effect |
| --- | --- | --- | --- | --- |
| `selectedSiteId` | Stato condiviso persistente | `WeatherWorkspaceProvider` | Context e `useState` | Scrittura su storage |
| `temperatureUnit` | Stato condiviso persistente | `WeatherWorkspaceProvider` | Context e `useState` | Scrittura su storage |
| `selectedSite` | Derived state | `WeatherWorkspaceProvider` | Ricerca nel catalogo durante il render | Nessuno |
| `forecast` | Server state | `useForecast` | Stato della richiesta | Richiesta HTTP |
| `status` | Server state | `useForecast` | Stato discriminato | Richiesta HTTP |
| `error` | Server state | `useForecast` | Stato della richiesta | Richiesta HTTP |
| richiesta di retry o refresh | Evento utente | `useForecast` | Callback invocata dall'event handler | La callback aggiorna il trigger della richiesta |
| URL Open-Meteo | Valore derivato | Adapter Open-Meteo | `URLSearchParams` | Nessuno |
| previsione giornaliera | Dato di dominio | Adapter Open-Meteo | Mapping del payload validato | Nessuno |
| etichette e formattazione | Derived state | Componenti di presentazione | Funzioni pure durante il render | Nessuno |

## Confini

`WeatherWorkspaceProvider` distribuisce preferenze dell'utente. Non conosce
`Forecast`, `fetch` o lo stato della richiesta. `useForecast` riceve sede,
unità e adapter, poi possiede il ciclo asincrono. L'adapter conosce il formato
Open-Meteo e restituisce solo tipi del dominio dell'app.

```text
WeatherWorkspaceProvider
  -> selectedSite e temperatureUnit
  -> WeatherDashboard
       -> useForecast
            -> WeatherApi
                 -> Open-Meteo
```

## Schede degli Effect

| Effect | Sistema esterno | Dipendenze | Cleanup | StrictMode |
| --- | --- | --- | --- | --- |
| Persistenza preferenze | `localStorage` | `selectedSiteId`, `temperatureUnit`, `storage` | Non necessario, la scrittura termina nello stesso task | Ripete una scrittura idempotente |
| Caricamento previsioni | Open-Meteo tramite `WeatherApi` | adapter, sede, unità, trigger di retry o refresh | `AbortController.abort()` | La prima richiesta di sviluppo viene annullata e la seconda resta attiva |

L'inizializzazione delle preferenze usa la funzione inizializzatrice di
`useState`. La lettura non richiede un Effect perché serve a calcolare il primo
render. Il codice controlla chiavi, valori ammessi e JSON non valido prima di
accettare il contenuto dello storage.

## Failure mode controllati

| Caso | Comportamento atteso |
| --- | --- |
| Risposta HTTP non `ok` | L'adapter lancia un errore con un messaggio utilizzabile. |
| Payload incompleto o incoerente | L'adapter rifiuta il payload. La UI mostra lo stato di errore. |
| Serie giornaliera vuota | Il custom hook o la UI mostra l'empty state. |
| Cambio sede o unità durante la richiesta | Il cleanup annulla la richiesta precedente. |
| `AbortError` | L'hook ignora l'annullamento e non mostra un errore. |
| Storage corrotto | Il Provider usa Milano e Celsius. |
| Rete assente nei test | I test usano adapter e `fetch` iniettati. |

## Controlli per la code review

- [ ] Ogni valore possiede un proprietario riconoscibile.
- [ ] Il Context non contiene server state.
- [ ] Derived state non possiede setter né Effect.
- [ ] La API esterna non compare nei componenti MUI.
- [ ] L'Effect della richiesta include dipendenze e cleanup.
- [ ] Retry e refresh partono da event handler.
- [ ] L'interfaccia espone loading, error, empty e success.
- [ ] L'attribuzione a Open-Meteo resta visibile.
- [ ] I test non dipendono dalla disponibilità del servizio pubblico.
