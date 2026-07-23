# Lezione guidata: Meteo Sedi con useEffect e Context

## Obiettivo della lezione

Completa una dashboard meteo per quattro sedi aziendali. Lo starter mostra la
shell, i controlli e lo stato iniziale, ma non esegue richieste HTTP. Durante i
dieci TODO aggiungerai preferenze condivise, persistenza, accesso a Open-Meteo
e gestione del ciclo asincrono.

Il laboratorio approfondisce due strumenti:

- Context distribuisce sede e unità di misura ai componenti che le usano;
- `useEffect` sincronizza il rendering con `localStorage` e con la richiesta
  esterna.

Il server state resta nel custom hook. Questa separazione permette di seguire
il ciclo della richiesta senza trasformare il Provider in un contenitore di
tutti i dati dell'app.

## Risultato del Modulo 2

Il laboratorio integra il Modulo 2 del programma. Alla fine consegnerai
l'applicazione funzionante e la mappa che assegna un proprietario a stato
condiviso, server state, derived state ed Effect.

## Cosa stai costruendo

Meteo Sedi usa coordinate già note per Milano, Torino, Bologna e Bari. La
dashboard mostra:

- temperatura corrente e percepita;
- velocità del vento e codice meteo;
- previsione per cinque giorni;
- selezione della sede e dell'unità Celsius o Fahrenheit;
- loading, errore, assenza di dati, retry e refresh.

Open-Meteo espone il servizio Forecast tramite HTTPS. Per questo laboratorio
non servono account o chiavi. L'interfaccia deve mantenere visibile
l'attribuzione a [Open-Meteo](https://open-meteo.com/).

Il tier gratuito non garantisce disponibilità. Lo starter iniziale non usa la
rete. I test iniettano dipendenze controllate e non usano la rete reale. La
soluzione mostra uno stato di errore con retry quando il servizio non risponde.

## Prerequisiti

- Node.js 22.13 o successivo. Il progetto include `.nvmrc`.
- npm 10 o successivo.
- Conoscenza di componenti funzionali, props e `useState`.
- Conoscenza di Promise, `async/await`, `fetch` e JSON.

## Avvio

Esegui i comandi dalla radice della repository:

```bash
cd progetto2bis/starter/meteo-sedi
nvm use
npm ci
npm run dev
```

Se non usi `nvm`, salta `nvm use` e controlla le versioni con:

```bash
node --version
npm --version
```

Lo starter deve mostrare quattro sedi e il messaggio che invita a completare i
TODO. Non deve mostrare previsioni e non deve chiamare `fetch`.

La suite inietta una `WeatherApi` controllata in `App`. Non usa la rete reale e
continua a verificare la shell quando il TODO 08 attiva la richiesta.

Chiudi il controllo iniziale con:

```bash
npm run check
```

## Struttura di lavoro

```text
src/
├── App.tsx
├── main.tsx
├── theme.ts
├── test/
│   └── setup.ts
└── weather/
    ├── components/
    │   └── WeatherDashboard.tsx
    ├── sites.ts
    ├── hooks/
    │   └── useForecast.ts
    ├── services/
    │   └── WeatherApi.ts
    ├── state/
    │   └── WeatherWorkspaceContext.tsx
    └── weather.types.ts
```

## Metodo di lavoro

Per ogni TODO:

1. compila la riga corrispondente nella mappa;
2. leggi il file indicato nel punto di partenza;
3. implementa il passaggio senza copiare il successivo;
4. prova il comportamento e il failure mode indicati;
5. esegui `npm run check`.

Confronta il codice con `progetto2bis/soluzione/meteo-sedi` dopo il tuo
tentativo. I blocchi richiudibili contengono una soluzione completa del
passaggio, non un file da copiare prima di aver ragionato sulle dipendenze.

---

## TODO 01: classifica stato, dati derivati e sincronizzazioni

### Obiettivo

Assegna un proprietario a ogni valore prima di aggiungere Context o Effect.

### Concetto

React usa stato per ricordare un valore tra due render. Un valore calcolabile
da stato e props è derived state. Un Effect serve quando il componente deve
sincronizzarsi con un sistema esterno, come storage o rete.

### Punto di partenza

`WeatherDashboard` riceve il catalogo locale delle sedi e rende uno stato `idle`.
I tipi di dominio e le firme di Context, adapter e hook indicano i confini da
completare.

### File

- `src/weather/components/WeatherDashboard.tsx`
- `src/weather/weather.types.ts`
- `src/weather/sites.ts`
- `../../documentazione/mappa-effect-context-studente.md`

### Passaggi

1. Cerca tutti gli `useState` dello starter.
2. Scrivi per ogni valore sorgente, lettori e modificatori.
3. Segna `selectedSiteId` e `temperatureUnit` come stato condiviso persistente.
4. Segna `selectedSite` come derived state. Deriva dal catalogo e dall'id.
5. Segna previsione, stato della richiesta ed errore come server state.
6. Segna retry e refresh come eventi utente che richiedono una nuova lettura.
7. Individua le due sincronizzazioni esterne: storage e Open-Meteo.
8. Compila le due schede degli Effect nella mappa senza scrivere codice.

### Codice completo del passaggio

<details>
<summary>Apri un esempio completo delle righe da scrivere nella mappa</summary>

```md
| Valore | Sorgente | Chi legge | Chi modifica | Categoria | Proprietario | Serve un Effect? |
| --- | --- | --- | --- | --- | --- | --- |
| selectedSiteId | Preferenza iniziale o scelta utente | Provider e controlli | selectSite | Stato condiviso persistente | WeatherWorkspaceProvider | Sì, scrittura storage |
| temperatureUnit | Preferenza iniziale o scelta utente | Provider, controlli e hook | setTemperatureUnit | Stato condiviso persistente | WeatherWorkspaceProvider | Sì, scrittura storage |
| selectedSite | catalogo e selectedSiteId | pagina e hook | Nessuno | Derived state | Calcolo nel Provider | No |
| forecast | WeatherApi | pagina | useForecast | Server state | useForecast | Sì, richiesta HTTP |
| status | Ciclo della Promise | pagina | useForecast | Server state | useForecast | Sì, richiesta HTTP |
| error | Errore del servizio | pagina | useForecast | Server state | useForecast | Sì, richiesta HTTP |
| retry o refresh | Click utente | useForecast | event handler | Evento | WeatherDashboard | Nessun Effect dedicato |
| URL della richiesta | sede e unità | WeatherApi | Nessuno | Derived state | buildForecastUrl | No |
```

</details>

### Spiegazione

`selectedSite` non richiede un setter. Il Provider cerca nel catalogo la sede
che corrisponde a `selectedSiteId` durante il render. Salvare anche l'oggetto
creerebbe due fonti di verità.

Il click su retry appartiene all'event handler. L'handler modifica il trigger
della richiesta o chiama una funzione restituita dall'hook. Un Effect separato
che osserva un booleano `shouldRetry` aggiungerebbe uno stato intermedio.

### Verifica

```bash
rg "useState|useEffect|useContext" src/weather
```

Spiega a voce la categoria di ogni risultato. In questo TODO non modificare i
componenti.

### Errori comuni

- Inserire `selectedSite` in un secondo `useState`.
- Chiamare globale ogni valore letto dalla pagina.
- Mettere i dati dell'API nel Context perché più componenti li mostrano.
- Usare un Effect per gestire un click.

### Checkpoint

- [ ] Ogni valore possiede una categoria e un proprietario.
- [ ] La mappa distingue Context e server state.
- [ ] Le schede descrivono storage e rete.
- [ ] `npm run check` termina senza errori.

---

## TODO 02: implementa il Context e il custom hook di accesso

### Obiettivo

Crea il Provider che condivide sede selezionata e unità. Fai fallire con un
messaggio chiaro l'uso del custom hook fuori dal Provider.

### Concetto

Context evita di inoltrare le stesse props attraverso componenti che non le
usano. Il Provider possiede lo stato condiviso. Il custom hook nasconde
`useContext` e applica il vincolo di utilizzo.

### Punto di partenza

Nello starter `WeatherWorkspaceContext.tsx` espone il contratto e un Provider
con azioni vuote. Milano e Celsius sono i valori iniziali del laboratorio.

### File

- `src/weather/state/WeatherWorkspaceContext.tsx`
- `src/App.tsx`

### Passaggi

1. Definisci `WeatherWorkspaceValue` con i sei membri richiesti.
2. Crea il Context con valore iniziale `undefined`.
3. Nel Provider crea `selectedSiteId` e `temperatureUnit` con `useState`.
4. Deriva `selectedSite` con `find` sul catalogo. Usa Milano come fallback.
5. Mantieni temporaneamente due azioni vuote con le firme del contratto.
6. Passa valore e azioni temporanee al Provider.
7. Implementa `useWeatherWorkspace` e lancia un errore fuori dal Provider.
8. Avvolgi `WeatherDashboard` con `WeatherWorkspaceProvider` in `App.tsx`.

### Codice completo del passaggio

<details>
<summary>Apri WeatherWorkspaceContext.tsx completo, senza persistenza</summary>

```tsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import { officeSites } from '../sites';
import type { OfficeSite, TemperatureUnit } from '../weather.types';

type WeatherWorkspaceValue = {
  selectedSiteId: string;
  selectedSite: OfficeSite;
  temperatureUnit: TemperatureUnit;
  selectSite: (siteId: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
};

const WeatherWorkspaceContext = createContext<
  WeatherWorkspaceValue | undefined
>(undefined);

export function WeatherWorkspaceProvider({ children }: PropsWithChildren) {
  const [selectedSiteId] = useState(officeSites[0].id);
  const [temperatureUnit] = useState<TemperatureUnit>('celsius');

  const selectedSite =
    officeSites.find((site) => site.id === selectedSiteId) ?? officeSites[0];

  return (
    <WeatherWorkspaceContext.Provider
      value={{
        selectedSiteId,
        selectedSite,
        temperatureUnit,
        selectSite: () => undefined,
        setTemperatureUnit: () => undefined,
      }}
    >
      {children}
    </WeatherWorkspaceContext.Provider>
  );
}

export function useWeatherWorkspace() {
  const value = useContext(WeatherWorkspaceContext);

  if (!value) {
    throw new Error(
      'useWeatherWorkspace deve essere usato dentro WeatherWorkspaceProvider',
    );
  }

  return value;
}
```

`src/App.tsx`

```tsx
import { WeatherDashboard } from './weather/components/WeatherDashboard';
import { createOpenMeteoWeatherApi } from './weather/services/createOpenMeteoWeatherApi';
import type { WeatherApi } from './weather/services/WeatherApi';
import { WeatherWorkspaceProvider } from './weather/state/WeatherWorkspaceContext';

const defaultWeatherApi = createOpenMeteoWeatherApi();

export function App({ api = defaultWeatherApi }: { api?: WeatherApi }) {
  return (
    <WeatherWorkspaceProvider>
      <WeatherDashboard api={api} />
    </WeatherWorkspaceProvider>
  );
}
```

</details>

### Spiegazione

Il valore `undefined` rende riconoscibile l'assenza del Provider. Un oggetto di
default nasconderebbe l'errore e potrebbe lasciare pulsanti senza effetto.

La ricerca di `selectedSite` è un calcolo breve. Non richiede `useMemo` e non
richiede un Effect. Aggiungi memoizzazione solo dopo aver misurato un costo
o un problema di identità che incide sui consumer.

### Verifica

```bash
npm run lint
npm run test
```

Aggiungi per prova un consumer fuori dal Provider. Il messaggio deve citare
`WeatherWorkspaceProvider`. Rimuovi la prova dopo il controllo.

### Errori comuni

- Creare il Context con un oggetto fittizio.
- Conservare sia id sia oggetto della sede nello stato.
- Cambiare già le preferenze. Implementerai le azioni nel TODO 03.
- Inserire `forecast` nel valore del Provider.

### Checkpoint

- [ ] Il Provider espone i sei membri del contratto.
- [ ] Milano e Celsius sono i default.
- [ ] Il custom hook segnala l'uso fuori dal Provider.
- [ ] `selectedSite` non possiede un setter.
- [ ] Le due azioni rispettano la firma e non cambiano ancora lo stato.
- [ ] `npm run check` termina senza errori.

---

## TODO 03: collega selezione e unità senza prop drilling

### Obiettivo

Collega i controlli MUI al Context. La pagina deve mostrare la sede selezionata
senza ricevere preferenze attraverso props intermedie.

### Concetto

Un consumer legge dal Context solo i dati necessari al proprio compito. Gli
event handler aggiornano lo stato condiviso nel momento dell'interazione.

### Punto di partenza

La shell mostra quattro pulsanti sede e un controllo per l'unità. Nello
starter i controlli non aggiornano il workspace oppure usano valori locali.

### File

- `src/weather/components/WeatherDashboard.tsx`
- `src/weather/state/WeatherWorkspaceContext.tsx`

### Passaggi

1. Chiama `useWeatherWorkspace` dentro `WeatherDashboard`.
2. Nel Provider conserva i setter restituiti dai due `useState`.
3. Implementa `selectSite` e rifiuta id fuori dal catalogo.
4. Implementa `setTemperatureUnit` con il setter dedicato.
5. Per ogni pulsante sede confronta l'id con `selectedSiteId`.
6. Nell'`onClick` chiama `selectSite(site.id)`.
7. Collega il controllo unità a `temperatureUnit`.
8. Nell'`onChange` passa il valore valido a `setTemperatureUnit`.
9. Controlla focus, nome accessibile e stato selezionato dei controlli.

### Codice completo del passaggio

<details>
<summary>Apri il blocco completo dei controlli connessi al Context</summary>

Sostituisci nello starter il blocco dei controlli con questo codice. Mantieni
il layout e lo stato meteo già presenti nel file.

```tsx
// Dentro WeatherWorkspaceProvider, sostituisci gli state e le azioni vuote.
const [selectedSiteId, setSelectedSiteId] = useState(officeSites[0].id);
const [temperatureUnit, setTemperatureUnitState] =
  useState<TemperatureUnit>('celsius');

function selectSite(siteId: string) {
  if (officeSites.some((site) => site.id === siteId)) {
    setSelectedSiteId(siteId);
  }
}

function setTemperatureUnit(unit: TemperatureUnit) {
  setTemperatureUnitState(unit);
}

// Dentro WeatherDashboard, leggi lo stato condiviso.
const {
  selectedSiteId,
  temperatureUnit,
  selectSite,
  setTemperatureUnit,
} = useWeatherWorkspace();

<Stack spacing={2.5}>
  <Box>
    <Typography component="h2" variant="h2" sx={{ mb: 1.5 }}>
      Sede
    </Typography>
    <Stack
      role="group"
      aria-label="Scegli sede"
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: 'wrap' }}
    >
    {officeSites.map((site) => (
      <Button
        key={site.id}
        variant={selectedSiteId === site.id ? 'contained' : 'outlined'}
        aria-pressed={selectedSiteId === site.id}
        onClick={() => selectSite(site.id)}
      >
        {site.city}
      </Button>
    ))}
    </Stack>
  </Box>
  <Box>
    <Typography id="unit-label" component="h2" variant="h2" sx={{ mb: 1.5 }}>
      Unità di temperatura
    </Typography>
    <ToggleButtonGroup
      exclusive
      value={temperatureUnit}
      aria-labelledby="unit-label"
      onChange={(_event, value: TemperatureUnit | null) => {
        if (value) setTemperatureUnit(value);
      }}
    >
      <ToggleButton value="celsius">Celsius</ToggleButton>
      <ToggleButton value="fahrenheit">Fahrenheit</ToggleButton>
    </ToggleButtonGroup>
  </Box>
</Stack>
```

Import necessari:

```tsx
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { officeSites } from '../sites';
import { useWeatherWorkspace } from '../state/WeatherWorkspaceContext';
import type { TemperatureUnit } from '../weather.types';
```

</details>

### Spiegazione

`aria-pressed` comunica la selezione dei pulsanti sede anche senza il colore.
`ToggleButtonGroup` può restituire `null` se l'utente preme l'opzione già
selezionata. Il controllo evita di salvare un valore non previsto.

L'unità cambia nell'handler. Non serve un Effect che osserva un valore locale
e lo copia nel Context.

### Verifica

1. Seleziona Torino e controlla lo stato premuto.
2. Passa a Fahrenheit e torna a Celsius.
3. Usa solo `Tab`, `Invio` e barra spaziatrice.
4. Controlla che la console non mostri warning.

```bash
npm run check
```

### Errori comuni

- Conservare una seconda sede selezionata in `WeatherDashboard`.
- Aggiornare il Context dentro un Effect anziché nell'handler.
- Usare il colore come unico segnale di selezione.
- Accettare `null` da `ToggleButtonGroup`.

### Checkpoint

- [ ] Tutte le sedi si possono selezionare con tastiera e mouse.
- [ ] Il cambio unità aggiorna il Context.
- [ ] La pagina non riceve preferenze tramite props.
- [ ] Nessun Effect copia stato locale nel Provider.
- [ ] `npm run check` termina senza errori.

---

## TODO 04: persisti le preferenze in modo difensivo

### Obiettivo

Ripristina sede e unità dopo il reload. Usa i default quando lo storage manca,
contiene JSON non valido o presenta valori fuori dal catalogo.

### Concetto

La funzione inizializzatrice di `useState` calcola il primo valore una sola
volta per montaggio. Un Effect sincronizza le modifiche successive con
`localStorage`.

### Punto di partenza

Il Provider usa Milano e Celsius a ogni caricamento e perde la scelta al
reload.

### File

- `src/weather/state/WeatherWorkspaceContext.tsx`

### Passaggi

1. Definisci una chiave di storage specifica e versionata.
2. Descrivi con un tipo l'oggetto persistito.
3. Implementa una type guard per le unità ammesse.
4. Leggi lo storage dentro `try/catch`.
5. Accetta la sede solo se il catalogo contiene l'id.
6. Accetta uno storage iniettato nel Provider per rendere i test indipendenti.
7. Usa la funzione `readPreferences` nell'inizializzatore di `useState`.
8. Aggiungi un Effect che scrive id e unità quando cambiano.
9. Proteggi anche la scrittura con `try/catch`.
10. Mantieni `selectedSite` derivata durante il render.

### Codice completo del passaggio

<details>
<summary>Apri WeatherWorkspaceContext.tsx completo con persistenza</summary>

```tsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { officeSites } from '../sites';
import type { OfficeSite, TemperatureUnit } from '../weather.types';

export const preferencesStorageKey =
  'react-aziendale:meteo-sedi:preferences:v1';

type StoredPreferences = {
  selectedSiteId: string;
  temperatureUnit: TemperatureUnit;
};

type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem'>;

type WeatherWorkspaceValue = {
  selectedSiteId: string;
  selectedSite: OfficeSite;
  temperatureUnit: TemperatureUnit;
  selectSite: (siteId: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
};

const defaultPreferences: StoredPreferences = {
  selectedSiteId: officeSites[0].id,
  temperatureUnit: 'celsius',
};

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === 'celsius' || value === 'fahrenheit';
}

function isKnownSiteId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    officeSites.some((site) => site.id === value)
  );
}

function getBrowserStorage(): PreferencesStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readPreferences(
  storage: PreferencesStorage | undefined = getBrowserStorage(),
): StoredPreferences {
  if (!storage) return defaultPreferences;

  try {
    const rawValue = storage.getItem(preferencesStorageKey);
    if (!rawValue) return defaultPreferences;

    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== 'object' || parsed === null) {
      return defaultPreferences;
    }

    const selectedSiteId =
      'selectedSiteId' in parsed ? parsed.selectedSiteId : null;
    const temperatureUnit =
      'temperatureUnit' in parsed ? parsed.temperatureUnit : null;

    return {
      selectedSiteId: isKnownSiteId(selectedSiteId)
        ? selectedSiteId
        : defaultPreferences.selectedSiteId,
      temperatureUnit: isTemperatureUnit(temperatureUnit)
        ? temperatureUnit
        : defaultPreferences.temperatureUnit,
    };
  } catch {
    return defaultPreferences;
  }
}

const WeatherWorkspaceContext = createContext<WeatherWorkspaceValue | null>(
  null,
);

export function WeatherWorkspaceProvider({
  children,
  storage = getBrowserStorage(),
}: {
  children: ReactNode;
  storage?: PreferencesStorage;
}) {
  const [initialPreferences] = useState(() => readPreferences(storage));
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialPreferences.selectedSiteId,
  );
  const [temperatureUnit, setTemperatureUnitState] =
    useState<TemperatureUnit>(initialPreferences.temperatureUnit);

  const selectedSite =
    officeSites.find((site) => site.id === selectedSiteId) ??
    officeSites[0];

  useEffect(() => {
    if (!storage) return;
    try {
      storage.setItem(
        preferencesStorageKey,
        JSON.stringify({ selectedSiteId, temperatureUnit }),
      );
    } catch {
      // L'app resta utilizzabile se il browser blocca o esaurisce lo storage.
    }
  }, [selectedSiteId, storage, temperatureUnit]);

  function selectSite(siteId: string) {
    if (isKnownSiteId(siteId)) setSelectedSiteId(siteId);
  }

  function setTemperatureUnit(unit: TemperatureUnit) {
    setTemperatureUnitState(unit);
  }

  const value: WeatherWorkspaceValue = {
    selectedSiteId,
    selectedSite,
    temperatureUnit,
    selectSite,
    setTemperatureUnit,
  };

  return (
    <WeatherWorkspaceContext.Provider value={value}>
      {children}
    </WeatherWorkspaceContext.Provider>
  );
}

export function useWeatherWorkspace() {
  const context = useContext(WeatherWorkspaceContext);
  if (!context) {
    throw new Error('useWeatherWorkspace richiede WeatherWorkspaceProvider.');
  }
  return context;
}
```

</details>

### Spiegazione

La lettura parte nell'inizializzatore perché il primo render deve già usare la
preferenza corretta. Leggere lo storage in un Effect causerebbe un render con i
default e un secondo render con i valori salvati.

La scrittura è una sincronizzazione con un sistema esterno. L'Effect dipende
da `selectedSiteId`, `temperatureUnit` e `storage`, che legge. In StrictMode
React esegue un ciclo di setup e cleanup aggiuntivo in sviluppo. La scrittura
ripetuta dello stesso JSON è idempotente e non cambia il risultato.

Il Provider accetta un oggetto con `getItem` e `setItem`. Il test può passare
uno storage in memoria. Il browser può bloccare `localStorage` o esaurire lo
spazio, quindi il codice protegge sia lettura sia scrittura.

### Verifica

1. Seleziona Bari e Fahrenheit.
2. Ricarica la pagina.
3. Apri DevTools, Application, Local Storage e controlla la chiave.
4. Sostituisci il valore con `{errore` e ricarica.
5. Controlla che l'app torni a Milano e Celsius senza bloccarsi.

```bash
npm run check
```

### Errori comuni

- Chiamare `JSON.parse` senza `try/catch`.
- Accettare valori dello storage con un cast TypeScript.
- Leggere lo storage a ogni render.
- Salvare `selectedSite` insieme al suo id.
- Omettere `storage` dalle dipendenze dell'Effect.

### Checkpoint

- [ ] Le preferenze valide sopravvivono al reload.
- [ ] JSON e valori non validi usano i default.
- [ ] Lo storage contiene solo id e unità.
- [ ] StrictMode non cambia il risultato finale.
- [ ] `npm run check` termina senza errori.

---

## TODO 05: definisci il contratto e costruisci l'URL Open-Meteo

### Obiettivo

Isola il formato della richiesta dal rendering. Costruisci un URL con i soli
campi usati dall'interfaccia.

### Concetto

Il componente dipende dall'interfaccia `WeatherApi`, non da `fetch` o dai nomi
dei campi Open-Meteo. L'adapter traduce coordinate e unità nel protocollo
esterno.

### Punto di partenza

`WeatherApi.ts` contiene la firma di `getForecast`. Il file
`createOpenMeteoWeatherApi.ts` contiene TODO per URL, mapping e richiesta.

### File

- `src/weather/services/WeatherApi.ts`
- `src/weather/services/createOpenMeteoWeatherApi.ts`
- `src/weather/weather.types.ts`

### Passaggi

1. Controlla che `WeatherApi` riceva sede, unità e `AbortSignal`.
2. Crea una costante per l'endpoint Forecast.
3. Costruisci i parametri con `URLSearchParams`.
4. Imposta latitudine e longitudine dalla sede.
5. Richiedi i quattro campi correnti mostrati nella dashboard.
6. Richiedi codice meteo, minima e massima giornaliera.
7. Imposta `temperature_unit`, `wind_speed_unit`, `timezone` e cinque giorni.
8. Esporta `buildForecastUrl` per testarla come funzione pura.

### Codice completo del passaggio

<details>
<summary>Apri il contratto e la costruzione completa dell'URL</summary>

`src/weather/services/WeatherApi.ts`

```ts
import type { Forecast, OfficeSite, TemperatureUnit } from '../weather.types';

export interface WeatherApi {
  getForecast(
    site: OfficeSite,
    unit: TemperatureUnit,
    signal: AbortSignal,
  ): Promise<Forecast>;
}
```

Inserisci questo blocco in
`src/weather/services/createOpenMeteoWeatherApi.ts`:

```ts
import type { OfficeSite, TemperatureUnit } from '../weather.types';

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

export function buildForecastUrl(
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const searchParams = new URLSearchParams({
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  });

  return `${forecastEndpoint}?${searchParams.toString()}`;
}
```

</details>

### Spiegazione

`URLSearchParams` applica l'encoding e rende ogni parametro verificabile. Il
parametro `timezone=auto` chiede date e orari nella zona ricavata dalle
coordinate. `forecast_days=5` limita la risposta al periodo mostrato.

Il dominio usa `TemperatureUnit`. L'adapter sa che Open-Meteo accetta gli
stessi valori `celsius` e `fahrenheit`. Se il provider esterno cambiasse il
nome del parametro, modificheresti questo file senza toccare i componenti.

### Verifica

```ts
const url = new URL(buildForecastUrl(officeSites[0], 'fahrenheit'));
console.assert(url.hostname === 'api.open-meteo.com');
console.assert(url.searchParams.get('forecast_days') === '5');
console.assert(url.searchParams.get('temperature_unit') === 'fahrenheit');
```

Esegui poi:

```bash
npm run check
```

### Errori comuni

- Concatenare coordinate e parametri in una stringa.
- Richiedere campi che la UI non usa.
- Dimenticare `timezone=auto` e interpretare date in UTC.
- Inserire l'endpoint dentro `WeatherDashboard`.

### Checkpoint

- [ ] `WeatherApi` non importa React o MUI.
- [ ] L'URL contiene coordinate, campi, unità e cinque giorni.
- [ ] Il costruttore dell'URL è una funzione pura esportata.
- [ ] Nessun componente conosce l'endpoint.
- [ ] `npm run check` termina senza errori.

---

## TODO 06: implementa fetch, errori HTTP e AbortSignal

### Obiettivo

Esegui la richiesta e porta il segnale di annullamento fino a `fetch`. Rifiuta
le risposte HTTP non riuscite prima di leggere il payload come previsione.

### Concetto

`fetch` risolve la Promise anche per risposte 404 o 500. L'adapter deve
controllare `response.ok`. Il chiamante crea `AbortController`; il servizio usa
il suo `signal` senza crearne uno nuovo.

### Punto di partenza

`buildForecastUrl` produce l'indirizzo corretto. `getForecast` non effettua
ancora la richiesta oppure lancia un errore TODO.

### File

- `src/weather/services/createOpenMeteoWeatherApi.ts`

### Passaggi

1. Accetta `fetchImpl` nella factory e usa `globalThis.fetch` come default.
2. Implementa `getForecast` con `async/await`.
3. Passa `{ signal }` come secondo argomento di `fetchImpl`.
4. Controlla `response.ok` prima di chiamare `response.json()`.
5. Includi lo status nel messaggio per gli errori HTTP.
6. Leggi il JSON come `unknown`, non come `Forecast`.
7. Passa il valore a `mapOpenMeteoForecast`, che completerai nel TODO 07.

### Codice completo del passaggio

<details>
<summary>Apri la factory completa con richiesta e mapper temporaneo</summary>

```ts
import type { Forecast, OfficeSite, TemperatureUnit } from '../weather.types';
import type { WeatherApi } from './WeatherApi';

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

export function buildForecastUrl(
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const searchParams = new URLSearchParams({
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  });
  return `${forecastEndpoint}?${searchParams.toString()}`;
}

export function mapOpenMeteoForecast(_payload: unknown): Forecast {
  throw new Error('Completa il mapping Open-Meteo nel TODO 07.');
}

export function createOpenMeteoWeatherApi(
  fetchImpl: typeof fetch = globalThis.fetch,
): WeatherApi {
  return {
    async getForecast(site, unit, signal) {
      const response = await fetchImpl(buildForecastUrl(site, unit), {
        signal,
      });

      if (!response.ok) {
        throw new Error(`Richiesta meteo non riuscita (${response.status}).`);
      }

      const payload: unknown = await response.json();
      return mapOpenMeteoForecast(payload);
    },
  };
}
```

</details>

### Spiegazione

L'iniezione di `fetchImpl` permette ai test di fornire una funzione
controllata. I test non dipendono da DNS, connessione o disponibilità del
servizio pubblico.

`AbortSignal` attraversa il confine senza essere trasformato. Quando l'hook
chiama `abort()`, `fetch` rifiuta la Promise con un errore il cui `name` vale
`AbortError`.

### Verifica

Scrivi un test con un `fetchImpl` che restituisce `{ ok: false, status: 503 }`.
La Promise deve rifiutare con un messaggio che contiene `503`. Controlla anche
che il mock riceva lo stesso `signal` creato nel test.

```bash
npm run test
npm run lint
```

### Errori comuni

- Considerare `fetch` riuscita senza controllare `response.ok`.
- Creare `AbortController` nel servizio.
- Tipizzare `response.json()` come `Forecast` con un cast.
- Usare la rete reale nei test.

### Checkpoint

- [ ] Il servizio usa l'URL del TODO 05.
- [ ] `fetch` riceve l'`AbortSignal` del chiamante.
- [ ] Gli status HTTP non riusciti generano un errore.
- [ ] Il payload resta `unknown` fino alla validazione.
- [ ] `npm run check` termina senza errori.

---

## TODO 07: valida e trasforma il payload esterno

### Obiettivo

Trasforma i nomi Open-Meteo nei tipi del dominio. Rifiuta payload incompleti,
tipi errati e serie giornaliere con lunghezze diverse.

### Concetto

TypeScript controlla il codice compilato, non il JSON ricevuto. Il confine HTTP
deve verificare il valore a runtime prima di restituire `Forecast`.

### Punto di partenza

`getForecast` legge il JSON come `unknown`. `mapOpenMeteoForecast` lancia ancora
l'errore del TODO 06.

### File

- `src/weather/services/createOpenMeteoWeatherApi.ts`
- `src/weather/weather.types.ts`

### Passaggi

1. Crea helper per riconoscere record, numeri, date ISO e array tipizzati.
2. Controlla la presenza di `current` e `daily`.
3. Valida i cinque campi correnti richiesti dal dominio.
4. Valida le quattro serie giornaliere.
5. Controlla che le serie abbiano la stessa lunghezza.
6. Costruisci `CurrentWeather` rinominando i campi esterni.
7. Usa l'indice della data per costruire ogni `DailyForecast`.
8. Restituisci al massimo cinque giorni.

### Codice completo del passaggio

<details>
<summary>Apri createOpenMeteoWeatherApi.ts completo</summary>

```ts
import type { Forecast, OfficeSite, TemperatureUnit } from '../weather.types';
import type { WeatherApi } from './WeatherApi';

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readFiniteNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Campo meteo non valido: ${key}.`);
  }
  return value;
}

function readIsoDateTime(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value) ||
    !isIsoDate(value.slice(0, 10)) ||
    Number.isNaN(Date.parse(`${value}Z`))
  ) {
    throw new Error(`Campo meteo non valido: ${key}.`);
  }
  return value;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

function readNumberArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    !value.every(
      (item) => typeof item === 'number' && Number.isFinite(item),
    )
  ) {
    throw new Error(`Serie meteo non valida: ${key}.`);
  }
  return value as number[];
}

function readIsoDateArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    !value.every(isIsoDate)
  ) {
    throw new Error(`Serie meteo non valida: ${key}.`);
  }
  return value as string[];
}

export function buildForecastUrl(
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const searchParams = new URLSearchParams({
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    current:
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  });

  return `${forecastEndpoint}?${searchParams.toString()}`;
}

export function mapOpenMeteoForecast(payload: unknown): Forecast {
  if (
    !isRecord(payload) ||
    !isRecord(payload.current) ||
    !isRecord(payload.daily)
  ) {
    throw new Error('Risposta meteo incompleta.');
  }

  const dates = readIsoDateArray(payload.daily, 'time');
  const weatherCodes = readNumberArray(payload.daily, 'weather_code');
  const maximumTemperatures = readNumberArray(
    payload.daily,
    'temperature_2m_max',
  );
  const minimumTemperatures = readNumberArray(
    payload.daily,
    'temperature_2m_min',
  );
  const seriesLengths = new Set([
    dates.length,
    weatherCodes.length,
    maximumTemperatures.length,
    minimumTemperatures.length,
  ]);

  if (seriesLengths.size !== 1) {
    throw new Error('Le serie giornaliere hanno lunghezze diverse.');
  }

  return {
    current: {
      observedAt: readIsoDateTime(payload.current, 'time'),
      temperature: readFiniteNumber(payload.current, 'temperature_2m'),
      apparentTemperature: readFiniteNumber(
        payload.current,
        'apparent_temperature',
      ),
      windSpeed: readFiniteNumber(payload.current, 'wind_speed_10m'),
      weatherCode: readFiniteNumber(payload.current, 'weather_code'),
    },
    daily: dates.slice(0, 5).map((date, index) => ({
      date,
      minimumTemperature: minimumTemperatures[index],
      maximumTemperature: maximumTemperatures[index],
      weatherCode: weatherCodes[index],
    })),
  };
}

export function createOpenMeteoWeatherApi(
  fetchImpl: typeof fetch = globalThis.fetch,
): WeatherApi {
  return {
    async getForecast(site, unit, signal) {
      const response = await fetchImpl(buildForecastUrl(site, unit), { signal });
      if (!response.ok) {
        throw new Error(`Richiesta meteo non riuscita (${response.status}).`);
      }
      const payload: unknown = await response.json();
      return mapOpenMeteoForecast(payload);
    },
  };
}
```

</details>

### Spiegazione

Gli helper restringono `unknown` un controllo alla volta. Il mapper impedisce
ai nomi `temperature_2m` e `weather_code` di propagarsi nei componenti.

Una lista giornaliera vuota è valida dal punto di vista strutturale. Il custom
hook la classificherà come empty state. Una serie di minime con quattro valori
e una serie di date con cinque valori è incoerente e produce un errore.

### Verifica

Verifica almeno questi payload:

1. risposta completa con cinque giorni;
2. `daily.time` vuoto e tutte le altre serie vuote;
3. `current.temperature_2m` mancante;
4. serie giornaliere con lunghezze diverse;
5. numero rappresentato da una stringa;
6. data inesistente o fuori dal formato `YYYY-MM-DD`.

```bash
npm run test
```

### Errori comuni

- Usare `as Forecast` sul JSON.
- Controllare solo che `daily` esista.
- Usare `map` su una serie senza verificare le altre lunghezze.
- Restituire al dominio i nomi del provider esterno.

### Checkpoint

- [ ] Il mapper riceve `unknown`.
- [ ] Tutti i campi letti vengono validati.
- [ ] Serie incoerenti generano un errore controllato.
- [ ] Una serie vuota resta disponibile per l'empty state.
- [ ] `npm run check` termina senza errori.

---

## TODO 08: implementa la richiesta con dipendenze e cleanup

### Obiettivo

Carica le previsioni al montaggio e quando cambiano sede o unità. Annulla la
richiesta precedente durante il cleanup.

### Concetto

L'Effect sincronizza la selezione React con il servizio remoto. Le dipendenze
descrivono i valori reattivi letti. Il cleanup interrompe il lavoro che non
corrisponde più al render corrente.

### Punto di partenza

`useForecast` restituisce sempre lo stato `idle` e non chiama l'adapter.

### File

- `src/weather/hooks/useForecast.ts`

### Passaggi

1. Mantieni lo stato iniziale `idle` già presente.
2. Crea un `AbortController` dentro l'Effect.
3. Imposta lo stato `loading` prima della richiesta.
4. Chiama `api.getForecast(site, unit, controller.signal)`.
5. Salva la previsione nello stato `success`.
6. Ignora un errore con nome `AbortError`.
7. Trasforma gli altri errori in un messaggio leggibile.
8. Nel cleanup chiama `controller.abort()`.
9. Dichiara `api`, `site` e `unit` nelle dipendenze.
10. Lascia ancora inattivi `retry` e `refresh`: li completerai nel TODO 09.

### Codice completo del passaggio

<details>
<summary>Apri useForecast.ts con richiesta e cleanup</summary>

```ts
import { useEffect, useState } from 'react';
import type { WeatherApi } from '../services/WeatherApi';
import type {
  ForecastViewState,
  OfficeSite,
  TemperatureUnit,
} from '../weather.types';

const initialState: ForecastViewState = {
  status: 'idle',
  data: null,
  error: null,
};

const pendingAction = () => undefined;

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError')
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Errore imprevisto durante il caricamento.';
}

export function useForecast(
  api: WeatherApi,
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const [state, setState] = useState<ForecastViewState>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    void api
      .getForecast(site, unit, controller.signal)
      .then((forecast) => {
        if (controller.signal.aborted) return;
        setState({ status: 'success', data: forecast, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setState({
          status: 'error',
          data: null,
          error: getErrorMessage(error),
        });
      });

    return () => {
      controller.abort();
    };
  }, [api, site, unit]);

  return {
    ...state,
    retry: pendingAction,
    refresh: pendingAction,
  };
}
```

</details>

### Spiegazione

L'array contiene `api`, `site` e `unit` perché l'Effect li legge. Ometterne uno
lega la richiesta a un render precedente. L'istanza dell'adapter è già creata a
livello di modulo in `App.tsx`, quindi non cambia a ogni render.

`AbortController` interrompe `fetch`. StrictMode esegue setup, cleanup e un
secondo setup in sviluppo. La prima richiesta viene annullata, mentre la
seconda resta attiva. Questo ciclo rende visibile un cleanup mancante.

### Verifica

1. Monta l'hook con un adapter iniettato.
2. Controlla la transizione da loading a success.
3. Cambia la sede prima della risposta.
4. Controlla che il primo `signal` risulti annullato.
5. Rifiuta una richiesta con `AbortError` e verifica che non appaia un errore.

```bash
npm run test
npm run lint
```

### Errori comuni

- Dichiarare la funzione dell'Effect come `async`.
- Creare il controller fuori dall'Effect e riutilizzarlo.
- Ignorare `site`, `unit` o `api` nelle dipendenze.
- Mostrare un errore quando il cleanup annulla la richiesta.
- Usare un Effect per calcolare dati che derivano già dalle props.

### Checkpoint

- [ ] Il primo montaggio avvia la richiesta.
- [ ] Sede e unità avviano una nuova richiesta.
- [ ] Il cleanup annulla quella precedente.
- [ ] `AbortError` non genera feedback visibile.
- [ ] Retry e refresh sono ancora inattivi.
- [ ] `npm run check` termina senza errori.

---

## TODO 09: completa stati, azioni e risposte obsolete

### Obiettivo

Classifica success ed empty, attiva retry e refresh e impedisci a una risposta
vecchia di sovrascrivere la selezione corrente.

### Concetto

L'unione discriminata vincola dati ed errore al relativo status. Un contatore
riavvia la stessa sincronizzazione su richiesta dell'utente. Un id progressivo
protegge lo stato anche se un adapter ignora `AbortSignal`.

### Punto di partenza

Il TODO 08 gestisce richiesta, loading, success, error e cleanup. I pulsanti
della shell chiamano ancora funzioni vuote e una lista giornaliera vuota non è
ancora distinta da success.

### File

- `src/weather/hooks/useForecast.ts`
- `src/weather/components/WeatherDashboard.tsx`, solo per verificare i rami già presenti
- `src/App.tsx`, solo per verificare l'identità stabile dell'adapter

### Passaggi

1. Aggiungi un contatore `requestToken` allo stato.
2. Crea `requestAgain` con `useCallback` e incrementa il contatore.
3. Usa la stessa funzione per `retry` e `refresh`.
4. Aggiungi il contatore alle dipendenze dell'Effect.
5. Conserva in una ref l'id della richiesta più recente.
6. Ignora `then` e `catch` se l'id non è più corrente.
7. Classifica una previsione senza giorni come `empty`.
8. Mantieni `Forecast` soltanto nel ramo `success`.
9. Verifica skeleton, error, empty e success già predisposti nella dashboard.
10. Verifica `aria-live`, refresh e attribuzione Open-Meteo nella shell.

### Codice completo del passaggio

<details>
<summary>Apri useForecast.ts completo con stati e azioni</summary>

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeatherApi } from '../services/WeatherApi';
import type {
  ForecastViewState,
  OfficeSite,
  TemperatureUnit,
} from '../weather.types';

const initialState: ForecastViewState = {
  status: 'idle',
  data: null,
  error: null,
};

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError')
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Errore imprevisto durante il caricamento.';
}

export function useForecast(
  api: WeatherApi,
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const [state, setState] = useState<ForecastViewState>(initialState);
  const [requestToken, setRequestToken] = useState(0);
  const latestRequestId = useRef(0);

  const requestAgain = useCallback(() => {
    setRequestToken((currentToken) => currentToken + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setState({ status: 'loading', data: null, error: null });

    void api
      .getForecast(site, unit, controller.signal)
      .then((forecast) => {
        if (
          controller.signal.aborted ||
          requestId !== latestRequestId.current
        ) {
          return;
        }

        setState(
          forecast.daily.length === 0
            ? { status: 'empty', data: null, error: null }
            : { status: 'success', data: forecast, error: null },
        );
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          requestId !== latestRequestId.current ||
          isAbortError(error)
        ) {
          return;
        }

        setState({
          status: 'error',
          data: null,
          error: getErrorMessage(error),
        });
      });

    return () => {
      controller.abort();
    };
  }, [api, requestToken, site, unit]);

  return {
    ...state,
    retry: requestAgain,
    refresh: requestAgain,
  };
}
```

</details>

### Spiegazione

Il token non rappresenta un dato di dominio. Serve solo a ripetere la richiesta
con gli stessi parametri. Retry e refresh non richiedono un secondo Effect.

`latestRequestId` copre il caso in cui una dipendenza iniettata non rispetta il
segnale. Il controllo avviene sia nel ramo risolto sia nel ramo rifiutato. Una
risposta di Milano non può quindi sostituire quella di Torino.

La dashboard dello starter contiene già i cinque rami e le azioni. Il TODO
aggiunge le transizioni che li rendono raggiungibili. Non duplicare o spostare
il markup della shell.

### Verifica

1. Cambia sede durante il loading e risolvi per ultima la richiesta vecchia.
2. Controlla che restino visibili i dati della sede nuova.
3. Premi `Aggiorna dati` e verifica una nuova chiamata.
4. Genera un errore, premi `Riprova` e risolvi la chiamata successiva.
5. Restituisci `daily: []` e controlla l'empty state.
6. Controlla che l'attribuzione resti visibile in ogni stato.

```bash
npm run check
```

### Errori comuni

- Usare l'indice della sede come id della richiesta.
- Affidarsi soltanto ad `abort()` per evitare risposte obsolete.
- Creare un Effect separato per retry o refresh.
- Duplicare `Forecast` in più variabili di stato.
- Rendere `state.data` senza restringere prima lo status.

### Checkpoint

- [ ] Empty e success sono stati distinti.
- [ ] Retry e refresh avviano una nuova richiesta.
- [ ] Una risposta obsoleta non aggiorna lo stato.
- [ ] Ogni stato produce feedback accessibile.
- [ ] L'attribuzione Open-Meteo resta visibile.
- [ ] `npm run check` termina senza errori.

---

## TODO 10: completa test, mappa e code review

### Obiettivo

Verifica i confini senza usare la rete reale. Completa la mappa e controlla che
ogni Effect sincronizzi un sistema esterno.

### Concetto

I test sul comportamento controllano risultati, transizioni e cleanup. Le
dipendenze iniettate rendono i failure mode ripetibili e separano la suite
dalla disponibilità di Open-Meteo.

### Punto di partenza

La soluzione funziona nel browser. Restano da coprire adapter, Context, hook e
flusso integrato. La mappa dello studente contiene ancora righe incomplete.

### File

- `src/App.test.tsx`
- `src/weather/services/createOpenMeteoWeatherApi.test.ts`
- `src/weather/hooks/useForecast.test.tsx`
- `src/weather/state/WeatherWorkspaceContext.test.tsx`
- `../../documentazione/mappa-effect-context-studente.md`

### Passaggi

1. Testa URL, mapping, status HTTP e passaggio dell'AbortSignal.
2. Testa i default del Context e una modifica da un consumer.
3. Inserisci JSON corrotto nello storage e controlla il fallback.
4. Testa loading seguito da success, empty ed error nell'hook.
5. Cambia sede prima della risoluzione e controlla `signal.aborted`.
6. Rifiuta con `AbortError` e controlla l'assenza dello stato error.
7. Chiama retry e refresh e conta le nuove richieste.
8. Nello starter inietta una `WeatherApi` controllata e verifica che la suite
   non chiami `fetch`.
9. Completa mappa e schede degli Effect.
10. Esegui check, controllo link e ricerca dei trattini Unicode vietati.

### Codice completo del passaggio

<details>
<summary>Apri i test completi dei failure mode principali</summary>

Test del servizio con `fetch` iniettata:

```ts
import { describe, expect, it, vi } from 'vitest';
import { officeSites } from '../sites';
import {
  buildForecastUrl,
  createOpenMeteoWeatherApi,
  mapOpenMeteoForecast,
} from './createOpenMeteoWeatherApi';

const payload = {
  current: {
    time: '2026-07-23T12:00',
    temperature_2m: 25,
    apparent_temperature: 26,
    wind_speed_10m: 12,
    weather_code: 1,
  },
  daily: {
    time: ['2026-07-23'],
    temperature_2m_min: [18],
    temperature_2m_max: [29],
    weather_code: [1],
  },
};

describe('Open-Meteo adapter', () => {
  it('costruisce la query per sede e unità', () => {
    const url = new URL(buildForecastUrl(officeSites[0], 'fahrenheit'));
    expect(url.searchParams.get('latitude')).toBe('45.4642');
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(url.searchParams.get('forecast_days')).toBe('5');
  });

  it('mappa un payload valido', () => {
    expect(mapOpenMeteoForecast(payload)).toMatchObject({
      current: { temperature: 25, apparentTemperature: 26 },
      daily: [{ minimumTemperature: 18, maximumTemperature: 29 }],
    });
  });

  it('rifiuta serie incoerenti', () => {
    const invalid = {
      ...payload,
      daily: { ...payload.daily, temperature_2m_min: [] },
    };
    expect(() => mapOpenMeteoForecast(invalid)).toThrow(/lunghezze diverse/i);
  });

  it('controlla response.ok e inoltra il signal', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });
    const controller = new AbortController();
    const api = createOpenMeteoWeatherApi(fetchImpl as typeof fetch);

    await expect(
      api.getForecast(officeSites[0], 'celsius', controller.signal),
    ).rejects.toThrow(/503/);
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
```

Test del cleanup dell'hook con adapter controllato:

```tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { officeSites } from '../sites';
import type { WeatherApi } from '../services/WeatherApi';
import type { Forecast } from '../weather.types';
import { useForecast } from './useForecast';

const forecast: Forecast = {
  current: {
    observedAt: '2026-07-23T12:00',
    temperature: 25,
    apparentTemperature: 26,
    windSpeed: 12,
    weatherCode: 1,
  },
  daily: [
    {
      date: '2026-07-23',
      minimumTemperature: 18,
      maximumTemperature: 29,
      weatherCode: 1,
    },
  ],
};

describe('useForecast', () => {
  it('annulla la richiesta precedente quando cambia sede', async () => {
    const signals: AbortSignal[] = [];
    const api: WeatherApi = {
      getForecast: vi.fn((_site, _unit, signal) => {
        signals.push(signal);
        return new Promise<Forecast>(() => undefined);
      }),
    };

    const { rerender } = renderHook(
      ({ site }) => useForecast(api, site, 'celsius'),
      { initialProps: { site: officeSites[0] } },
    );

    await waitFor(() => expect(signals).toHaveLength(1));
    rerender({ site: officeSites[1] });
    await waitFor(() => expect(signals).toHaveLength(2));

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('retry e refresh generano nuove richieste', async () => {
    const api: WeatherApi = {
      getForecast: vi.fn().mockResolvedValue(forecast),
    };
    const { result } = renderHook(() =>
      useForecast(api, officeSites[0], 'celsius'),
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    act(() => result.current.retry());
    await waitFor(() => expect(api.getForecast).toHaveBeenCalledTimes(2));
    act(() => result.current.refresh());
    await waitFor(() => expect(api.getForecast).toHaveBeenCalledTimes(3));
  });
});
```

Controllo dello starter senza rete reale:

```tsx
import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { App } from './App';
import type { WeatherApi } from './weather/services/WeatherApi';

const pendingApi: WeatherApi = {
  getForecast: () => new Promise<never>(() => undefined),
};

it('non usa la rete reale durante i test', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  render(<App api={pendingApi} />);
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});
```

</details>

### Spiegazione

Il test del servizio inietta `fetch`. Il test dell'hook inietta `WeatherApi`.
Ogni livello sostituisce la dipendenza al proprio confine e non intercetta
dettagli interni del livello vicino.

Una Promise non risolta permette di osservare il cleanup senza attendere la
rete. `waitFor` sincronizza le asserzioni con gli aggiornamenti React. I test
devono controllare stato visibile e signal, non il numero di `setState`.

### Verifica

Esegui dalla cartella dello starter e poi dalla soluzione:

```bash
npm run check
```

Dalla radice della repository controlla link e caratteri vietati:

```bash
rg -n '\]\([^)]*\)' progetto2bis --glob '*.md'
rg -P '\x{2014}|\x{2013}' progetto2bis
```

Apri i link relativi del README e del brief. Confronta la tua mappa con
[`mappa-effect-context.md`](mappa-effect-context.md).

### Errori comuni

- Eseguire chiamate Open-Meteo durante i test.
- Usare timer arbitrari per attendere Promise.
- Testare variabili interne invece del comportamento.
- Dimenticare storage corrotto, empty state o `AbortError`.
- Disabilitare le regole degli Hook per far passare il lint.

### Checkpoint

- [ ] Starter e soluzione superano `npm run check`.
- [ ] La suite dello starter non chiama la rete reale.
- [ ] I test coprono Context, adapter, hook e flusso integrato.
- [ ] Cleanup, risposta obsoleta e `AbortError` hanno un test.
- [ ] Retry e refresh generano una nuova richiesta.
- [ ] La mappa assegna un proprietario a ogni valore.
- [ ] Link e percorsi Markdown esistono.
- [ ] Nessun file contiene em dash o en dash.

## Riferimenti

- [Documentazione Forecast di Open-Meteo](https://open-meteo.com/en/docs)
- [Termini e attribuzione Open-Meteo](https://open-meteo.com/en/terms)
- [Sincronizzare con gli Effect](https://react.dev/learn/synchronizing-with-effects)
- [Separare gli eventi dagli Effect](https://react.dev/learn/separating-events-from-effects)
- [Passare dati in profondità con Context](https://react.dev/learn/passing-data-deeply-with-context)
