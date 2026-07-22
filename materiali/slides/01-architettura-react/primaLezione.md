



# Architettura del Progetto e Design Pattern

Questi argomenti approfondiscono la parte architetturale del Modulo 1, dedicata alla progettazione di componenti leggibili, riutilizzabili e facilmente mantenibili in un progetto React aziendale. 

## Convenzioni di Naming e Standard di Sviluppo

### Distinzione tra cartelle strutturali e cartelle dei componenti

Le cartelle che rappresentano categorie generali del progetto vengono normalmente scritte in minuscolo, per esempio `components`, `hooks`, `services` e `utils`. Le cartelle che identificano uno specifico componente o una specifica feature utilizzano invece il PascalCase, come `Dashboard`, `UserProfile` o `ProductCard`. Questa distinzione permette di comprendere immediatamente se una cartella rappresenta un contenitore organizzativo oppure un elemento concreto dell’applicazione.

---

## Component Pairing Pattern

### Accoppiamento simmetrico tra file logici e file di stile

Il Component Pairing Pattern prevede che il file contenente la logica e il markup del componente sia affiancato dal relativo foglio di stile:

```text
Dashboard/
├── Dashboard.tsx
└── Dashboard.scss
```

Questa simmetria rende più semplice individuare i file collegati, riduce il tempo necessario per navigare nel progetto e facilita lo spostamento o l’eliminazione completa di un componente.

---

## Pattern di Composizione Avanzata

### Layout Container generici

Un Layout Container è un componente che definisce la struttura generale dell’interfaccia senza conoscere nel dettaglio il contenuto che dovrà mostrare. Può gestire elementi comuni come header, sidebar, spaziature e area principale, lasciando ai componenti figli la responsabilità di fornire il contenuto specifico.

```tsx
function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

### Iniezione dinamica tramite `children`

La prop speciale `children` permette di inserire dinamicamente uno o più elementi all’interno di un componente contenitore. In questo modo il layout rimane generico e riutilizzabile, mentre il contenuto può cambiare in base alla pagina o al contesto applicativo.

```tsx
<DashboardLayout>
  <OrdersPage />
</DashboardLayout>
```

La composizione evita di creare componenti rigidi con troppe prop dedicate e favorisce la costruzione di interfacce modulari.

---

## Separazione delle Responsabilità in Sass

### Gestione centralizzata degli stili globali

Variabili condivise come colori, font, spaziature e breakpoint possono essere raccolte in un file centrale, per esempio `_variables.scss`. In questo modo il design dell’applicazione viene controllato da un’unica fonte e le modifiche al tema possono essere applicate senza intervenire manualmente su decine di componenti.

```scss
// _variables.scss
$primary-color: #2563eb;
$spacing-md: 1rem;
$border-radius: 8px;
```

### Isolamento degli stili locali

Ogni componente dovrebbe contenere soltanto gli stili che riguardano direttamente la propria interfaccia. Evitare selettori globali troppo generici riduce il rischio che una regola CSS modifichi accidentalmente componenti lontani o non correlati.

```scss
.dashboard-card {
  padding: $spacing-md;
  border-radius: $border-radius;
}
```

L’obiettivo è rendere gli stili prevedibili, facilmente sostituibili e meno dipendenti dall’ordine di caricamento dei file.

---

# La Gestione dello Stato e la “Sala Macchine” di React

## Gestione dello Stato a Basso Livello con `useState`

### Anatomia della memoria interna di React

Quando un componente utilizza `useState`, il valore non viene conservato nella normale variabile dichiarata all’interno della funzione. React associa invece quello stato all’istanza interna del componente e lo recupera durante ogni rendering successivo.

```tsx
const [count, setCount] = useState(0);
```

`count` rappresenta il valore disponibile nel rendering corrente, mentre `setCount` comunica a React che lo stato deve essere aggiornato e che il componente potrebbe dover essere eseguito nuovamente.

### Fiber Nodes e memorizzazione degli Hook

React rappresenta internamente l’interfaccia attraverso una struttura chiamata Fiber. Ogni componente possiede un Fiber Node che contiene informazioni sul componente, sulle sue relazioni con gli altri elementi e sugli Hook utilizzati.

Gli Hook vengono associati al componente seguendo l’ordine in cui vengono chiamati. Per questo motivo non devono essere inseriti dentro condizioni o cicli: React deve poter ritrovare ogni Hook nella stessa posizione a ogni rendering.

```tsx
// Corretto
const [name, setName] = useState("");
const [age, setAge] = useState(0);

// Da evitare
if (isAdmin) {
  const [permissions, setPermissions] = useState([]);
}
```

---

## Il Ciclo di Re-render

### Riesecuzione del componente dopo un aggiornamento dello stato

Quando viene invocata una funzione come `setCount`, React pianifica un aggiornamento. Il componente viene rieseguito come una normale funzione e produce una nuova descrizione dell’interfaccia.

```tsx
setCount(previousCount => previousCount + 1);
```

Il re-render non significa necessariamente che tutto il DOM venga ricostruito. React calcola prima quali parti dell’interfaccia siano realmente cambiate.

### Variabili locali e persistenza dei valori

Le variabili locali vengono ricreate a ogni esecuzione del componente e quindi non conservano automaticamente il proprio valore tra un rendering e il successivo.

```tsx
function Counter() {
  let temporaryValue = 0;
  const [count, setCount] = useState(0);
}
```

`temporaryValue` riparte da zero a ogni render, mentre `count` viene conservato da React. Inoltre, quando lo stato contiene oggetti o array, questi non dovrebbero essere modificati direttamente: è preferibile creare un nuovo valore.

```tsx
setUser(previousUser => ({
  ...previousUser,
  name: "Marius",
}));
```

---

## Algoritmo di Riconciliazione

### Confronto tra le strutture del Virtual DOM

A ogni rendering React genera una nuova rappresentazione ad albero dell’interfaccia. Questa struttura viene confrontata con quella prodotta dal rendering precedente per individuare elementi aggiunti, rimossi o modificati.

React utilizza anche proprietà come `type` e `key` per capire se un elemento deve essere aggiornato oppure sostituito completamente.

```tsx
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}
```

Una `key` stabile permette a React di riconoscere correttamente ogni elemento della lista.

### Aggiornamenti mirati del DOM reale

Dopo aver individuato le differenze, React applica al DOM reale soltanto le modifiche necessarie. Se cambia il testo di un contatore, per esempio, non viene ricostruita l’intera pagina: viene aggiornato solamente il nodo interessato.

Questo processo riduce le operazioni sul DOM, che sono generalmente più costose rispetto ai normali calcoli eseguiti in JavaScript.

---

# Ciclo di Vita Asincrono e Ottimizzazione delle Prestazioni

## Controllo dei Side Effects con `useEffect`

### Sequenza Render, Commit e Paint

Durante la fase di **render**, React esegue i componenti e calcola la nuova interfaccia. Nella fase di **commit**, applica le modifiche al DOM reale. Successivamente il browser può eseguire il **paint**, mostrando il risultato sullo schermo.

Gli effetti dichiarati con `useEffect` vengono generalmente eseguiti dopo che React ha applicato le modifiche al DOM e, nei casi comuni, dopo che il browser ha avuto la possibilità di aggiornare visivamente la pagina.

```tsx
useEffect(() => {
  document.title = `Ordini: ${orders.length}`;
}, [orders.length]);
```

`useEffect` deve essere utilizzato per sincronizzare il componente con sistemi esterni, come API, timer, eventi del browser o WebSocket, non per eseguire normali calcoli derivabili dalle prop.

---

## Valutazione Cortocircuitata delle Dipendenze

### Gestione dell’array delle dipendenze

L’array delle dipendenze indica a React quali valori devono essere osservati per decidere se eseguire nuovamente un effetto.

```tsx
useEffect(() => {
  loadUser(userId);
}, [userId]);
```

Con un array vuoto, l’effetto viene eseguito dopo il primo montaggio. Senza array, viene eseguito dopo ogni render. Con una o più dipendenze, viene rieseguito quando almeno uno dei valori cambia.

### Confronto posizionale delle dipendenze

React confronta ogni dipendenza con quella presente nella stessa posizione durante il rendering precedente. Il confronto procede seguendo l’ordine dell’array e l’effetto deve essere rieseguito quando viene rilevata una differenza.

```tsx
useEffect(() => {
  updateSearch(query, category);
}, [query, category]);
```

Per questo motivo l’ordine delle dipendenze deve rimanere stabile e l’array non deve essere costruito con una lunghezza variabile.

---

## Shallow Comparison

### Confronto tramite uguaglianza del valore o del riferimento

Il confronto utilizzato da React per le dipendenze è basato su `Object.is`, un’operazione molto simile all’uguaglianza stretta `===`. React non analizza ricorsivamente tutte le proprietà interne di oggetti e array.

```tsx
Object.is(10, 10); // true
Object.is({}, {}); // false
```

Due oggetti con lo stesso contenuto vengono comunque considerati differenti se occupano riferimenti distinti in memoria.

### Tipi primitivi e tipi di riferimento

Valori primitivi come stringhe, numeri e booleani vengono confrontati direttamente attraverso il loro valore.

```tsx
Object.is("admin", "admin"); // true
```

Oggetti, array e funzioni vengono invece confrontati attraverso il riferimento. Un nuovo oggetto creato durante ogni render risulta quindi sempre diverso dal precedente.

```tsx
const filters = { status: "active" };

useEffect(() => {
  loadUsers(filters);
}, [filters]);
```

In questo esempio `filters` viene ricreato a ogni render e può causare l’esecuzione continua dell’effetto. È spesso preferibile dipendere dai singoli valori primitivi oppure stabilizzare il riferimento quando esiste una reale necessità.

---

## Gestione dei Residui di Memoria

### Cleanup Function

Un effetto può restituire una funzione di pulizia. React la esegue prima di rieseguire lo stesso effetto e quando il componente viene smontato.

```tsx
useEffect(() => {
  const timerId = setInterval(refreshData, 5000);

  return () => {
    clearInterval(timerId);
  };
}, []);
```

La cleanup function mantiene sincronizzato il ciclo di vita del componente con quello delle risorse esterne che ha creato.

### Chiusura di timer, listener e connessioni pendenti

Timer, event listener, subscription e connessioni WebSocket continuano a esistere anche se il componente che li ha creati non è più visibile. Devono quindi essere rimossi esplicitamente durante la pulizia.

```tsx
useEffect(() => {
  const handleResize = () => {
    console.log(window.innerWidth);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

Una cleanup mancante può produrre aggiornamenti duplicati, consumo inutile di memoria o tentativi di utilizzare risorse ormai non più valide.

---

## Tecnica del Debouncing

### Gestione dell’input con `setTimeout` e `clearTimeout`

Il debouncing ritarda l’esecuzione di un’operazione finché l’utente non smette di generare eventi per un determinato intervallo. A ogni nuova digitazione il timer precedente viene cancellato e ne viene creato uno nuovo.

```tsx
useEffect(() => {
  const timerId = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => {
    clearTimeout(timerId);
  };
}, [search]);
```

In questo caso il valore viene aggiornato soltanto quando l’utente non digita per almeno 500 millisecondi.

### Riduzione delle richieste verso le REST API

Senza debouncing, una ricerca potrebbe inviare una richiesta API per ogni carattere digitato. Scrivendo `react`, per esempio, potrebbero partire cinque richieste distinte.

Con il debouncing viene normalmente inviata soltanto la richiesta relativa al valore finale. Questo riduce il traffico di rete, il carico sul backend e il rischio che una risposta più vecchia sovrascriva risultati più recenti.