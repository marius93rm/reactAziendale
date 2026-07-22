# Architettura React Moderna Bis

---

# 1. Presentational e Container Components

## Componenti presentazionali

I componenti presentazionali si concentrano sull’aspetto visivo dell’interfaccia. Ricevono dati e funzioni tramite props, producono JSX e non dovrebbero conoscere il modo in cui i dati sono stati caricati o modificati. Il loro obiettivo è essere semplici, prevedibili e facilmente riutilizzabili.

```tsx
type UserListProps = {
  users: User[];
  onSelectUser: (userId: number) => void;
};

function UserList({ users, onSelectUser }: UserListProps) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <button onClick={() => onSelectUser(user.id)}>
            {user.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

`UserList` non esegue chiamate API e non decide come gestire l’utente selezionato. Si limita a rappresentare i dati ricevuti.

## Componenti container

I componenti container gestiscono stato, accesso ai dati e coordinamento tra le parti dell’interfaccia. Raccolgono le informazioni necessarie e le passano ai componenti presentazionali sotto forma di props.

```tsx
function UsersContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <UserList
      users={users}
      onSelectUser={setSelectedUserId}
    />
  );
}
```

Il container conosce la sorgente dei dati e le regole di coordinamento, mentre il componente presentazionale rimane indipendente dalla logica applicativa.

## Separazione concreta tra logica e interfaccia

Separare container e componenti presentazionali evita che fetch, stato, trasformazioni e JSX convivano nello stesso file. La separazione non deve però diventare una regola rigida: nei componenti piccoli una divisione artificiale può aumentare la complessità senza produrre reali benefici.

---

# 2. Custom Hooks

## Isolamento della logica di dominio

Un custom hook permette di estrarre dal componente una logica collegata a uno specifico comportamento applicativo. Il componente continua a utilizzare quella logica, ma non deve conoscerne tutti i dettagli interni.

```tsx
function useCartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}
```

Il nome del custom hook deve iniziare con `use`, in modo che React e gli strumenti di analisi possano riconoscerlo come Hook.

## Isolamento dell’accesso ai dati

Le chiamate API possono essere raccolte in un hook dedicato, evitando che ogni componente debba implementare manualmente loading, errore e aggiornamento dei dati.

```tsx
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return {
    users,
    isLoading,
    error,
  };
}
```

Il componente riceve un’interfaccia più semplice e non contiene direttamente la procedura di caricamento.

## Isolamento degli effetti collaterali

Event listener, timer, sincronizzazione con il browser e subscription possono essere incapsulati dentro custom hooks. In questo modo la registrazione e la relativa pulizia rimangono vicine e possono essere riutilizzate in più punti.

```tsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
}
```

## Stato riutilizzabile

Un custom hook non condivide automaticamente lo stesso stato tra tutti i componenti. Ogni chiamata crea un’istanza indipendente dello stato, ma riutilizza la stessa logica di gestione.

```tsx
function useToggle(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(current => !current);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
```

## Comportamento condiviso tra componenti

Quando più componenti implementano la stessa combinazione di stato, effetti e funzioni, un custom hook consente di eliminare duplicazioni senza introdurre necessariamente uno stato globale.

```tsx
function Modal() {
  const modal = useToggle();

  return (
    <>
      <button onClick={modal.open}>Apri</button>

      {modal.isOpen && (
        <div>
          <button onClick={modal.close}>Chiudi</button>
        </div>
      )}
    </>
  );
}
```

---

# 3. Riduzione del Prop Drilling

## Riconoscere catene di props troppo profonde

Il prop drilling si verifica quando un dato deve attraversare diversi livelli di componenti prima di raggiungere quello che lo utilizza realmente.

```tsx
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />
    </Sidebar>
  </Dashboard>
</App>
```

Il problema non è semplicemente passare props, ma obbligare componenti intermedi a conoscere dati che non utilizzano.

## Evitare props inutilizzate dai componenti intermedi

Un componente che riceve una prop soltanto per inoltrarla diventa accoppiato a una funzionalità che non gli appartiene. Questo rende più difficile modificare la struttura dell’applicazione perché ogni cambiamento deve attraversare l’intera catena.

## Ridurre il prop drilling tramite composition

La composition permette di passare direttamente un componente già configurato, evitando che il contenitore debba conoscere tutte le sue dipendenze.

```tsx
function Dashboard({ sidebar }: { sidebar: React.ReactNode }) {
  return (
    <div className="dashboard">
      <aside>{sidebar}</aside>
      <main>Contenuto principale</main>
    </div>
  );
}

function App() {
  return (
    <Dashboard
      sidebar={<UserMenu user={currentUser} />}
    />
  );
}
```

`Dashboard` non deve ricevere `user`, perché riceve direttamente l’elemento da mostrare.

## Utilizzare Context quando il dato è realmente condiviso

Context può essere appropriato per informazioni trasversali come autenticazione, tema, lingua o permessi. Non dovrebbe però essere utilizzato automaticamente per ogni dato, perché un context troppo ampio può aumentare l’accoppiamento e provocare render non necessari.

```tsx
const AuthContext = createContext<AuthContextValue | null>(null);

function UserMenu() {
  const auth = useContext(AuthContext);

  return <span>{auth?.user.name}</span>;
}
```

## Utilizzare custom hooks per nascondere la sorgente del dato

Un custom hook può offrire un’interfaccia stabile ai componenti, nascondendo il fatto che il dato provenga da Context, da uno store o da un servizio esterno.

```tsx
function useCurrentUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useCurrentUser deve essere usato dentro AuthProvider");
  }

  return context.user;
}
```

## Ridurre l’accoppiamento tra componenti

L’obiettivo non è eliminare tutte le props, ma fare in modo che ogni componente conosca soltanto i dati necessari alla propria responsabilità. Props dirette per relazioni locali, composition per strutture flessibili, Context per informazioni trasversali e custom hooks per esporre comportamenti riutilizzabili.

---

# 4. Feature-Based Structure

## Organizzazione del progetto per funzionalità

La feature-based structure raggruppa nello stesso spazio i file che collaborano alla stessa funzionalità applicativa.

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── auth.types.ts
│   ├── dashboard/
│   └── users/
├── shared/
├── services/
├── hooks/
├── utils/
└── App.tsx
```

La cartella `auth`, per esempio, contiene componenti, hook, tipi e servizi specifici dell’autenticazione.

## Cartella `features`

La cartella `features` rappresenta i principali domini funzionali dell’applicazione. Ogni feature dovrebbe possedere una responsabilità riconoscibile, come autenticazione, gestione utenti, ordini o dashboard.

```text
features/
├── auth/
├── orders/
├── products/
└── users/
```

Questa organizzazione facilita la navigazione perché il codice collegato allo stesso comportamento rimane vicino.

## Shared components

La cartella `shared` contiene componenti realmente generici e utilizzabili in più feature, come pulsanti, modali, input, card o layout.

```text
shared/
├── Button/
├── Modal/
├── TextField/
└── PageLayout/
```

Un componente non dovrebbe essere inserito in `shared` soltanto perché potrebbe essere riutilizzato in futuro. È preferibile spostarlo quando il riutilizzo diventa concreto.

## Services

I servizi gestiscono la comunicazione con API, storage o infrastrutture esterne. Non dovrebbero contenere JSX né dipendere direttamente dall’interfaccia.

```ts
export async function getUsers(): Promise<User[]> {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Errore durante il caricamento degli utenti");
  }

  return response.json();
}
```

I servizi possono essere generali oppure collocati direttamente nella feature a cui appartengono.

## Hooks

La cartella `hooks` raccoglie hook condivisi tra più parti dell’applicazione. Gli hook utilizzati da una sola feature dovrebbero invece rimanere all’interno della feature stessa.

```text
features/
└── users/
    └── hooks/
        └── useUsers.ts

hooks/
├── useDebounce.ts
└── useLocalStorage.ts
```

## Utils

Le utility sono funzioni pure e indipendenti da React, utilizzate per formattazioni, trasformazioni, validazioni o calcoli generici.

```ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
```

Una utility dovrebbe ricevere dati, restituire un risultato e non produrre effetti collaterali.

## Organizzazione per tipo tecnico

Una struttura per tipo tecnico raggruppa tutti i componenti, tutti gli hook e tutti i servizi in cartelle separate.

```text
src/
├── components/
├── hooks/
├── services/
├── pages/
└── utils/
```

Questo approccio è semplice nei progetti piccoli, ma può diventare dispersivo quando il numero di file cresce.

## Organizzazione per dominio

L’organizzazione per dominio raggruppa i file in base alla funzionalità aziendale a cui appartengono. Nei progetti medi o grandi tende a essere più scalabile perché riduce la distanza tra elementi che cambiano insieme.

```text
features/
└── orders/
    ├── OrderList.tsx
    ├── OrderFilters.tsx
    ├── useOrders.ts
    ├── orderService.ts
    └── order.types.ts
```

La scelta non deve essere necessariamente assoluta: è frequente utilizzare feature per il codice di dominio e cartelle condivise per gli elementi realmente trasversali.

---

# 5. Componenti Monolitici e Criteri di Scomposizione

## Quando scomporre un componente

Un componente dovrebbe essere scomposto quando gestisce responsabilità diverse, contiene sezioni visive indipendenti, presenta logica riutilizzabile oppure è diventato difficile da leggere e testare.

Segnali tipici:

* numerosi `useState` non correlati;
* diversi `useEffect`;
* molte condizioni nel JSX;
* chiamate API e trasformazioni complesse;
* porzioni di interfaccia riutilizzabili;
* difficoltà nel descrivere il componente con una sola frase.

## Quando mantenere insieme elementi correlati

Non ogni blocco JSX deve diventare un componente separato. Se una parte dell’interfaccia è piccola, non viene riutilizzata e dipende completamente dal componente padre, mantenerla nello stesso file può essere la scelta più leggibile.

```tsx
function UserCard({ user }: { user: User }) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <article>
      <h2>{fullName}</h2>
      <p>{user.email}</p>
    </article>
  );
}
```

Estrarre `UserCardTitle` e `UserCardEmail` non produrrebbe necessariamente un’architettura migliore.

## Quando la scomposizione diventa eccessiva

Una scomposizione eccessiva crea molti componenti minuscoli, file difficili da navigare e props che esistono soltanto per collegare frammenti troppo piccoli. Il numero di componenti non è un indicatore automatico di qualità: la divisione deve seguire responsabilità reali.

## Individuare responsabilità multiple

Un componente possiede responsabilità multiple quando deve contemporaneamente:

* caricare dati;
* gestire errori;
* applicare filtri;
* trasformare risultati;
* controllare una modale;
* gestire permessi;
* renderizzare un’interfaccia molto estesa.

In questi casi la logica può essere distribuita tra hook, servizi, utility e componenti presentazionali.

## Evitare il God Component

Un God Component concentra quasi tutto il comportamento di una pagina in un unico file. Conosce i dati, le API, le regole di business, le autorizzazioni e l’intera struttura visiva.

```tsx
function Dashboard() {
  // Fetch dei dati
  // Filtri
  // Ordinamento
  // Gestione modali
  // Permessi
  // Validazioni
  // Centinaia di righe di JSX
}
```

Il problema non è soltanto la lunghezza, ma l’elevato numero di motivi per cui il componente potrebbe dover cambiare.

---

# 6. Isolamento della Logica di Dominio

## Distinguere logica React e logica di business

La logica React riguarda rendering, stato, effetti e ciclo di vita. La logica di business rappresenta invece le regole dell’applicazione, come calcolare uno sconto, verificare un’autorizzazione o determinare lo stato di un ordine.

```ts
export function calculateDiscount(
  total: number,
  customerType: "standard" | "premium"
): number {
  if (customerType === "premium") {
    return total * 0.2;
  }

  return total * 0.05;
}
```

Questa funzione non dipende da React e può essere utilizzata in componenti, servizi o test.

## Estrarre trasformazioni e regole aziendali

Filtri, ordinamenti, aggregazioni e regole di validazione dovrebbero essere estratti quando rappresentano concetti del dominio.

```ts
export function getActiveUsers(users: User[]): User[] {
  return users.filter(user => user.status === "active");
}
```

Il nome della funzione rende esplicita la regola e permette di modificarla senza intervenire direttamente nel componente.

## Evitare la convivenza di troppe responsabilità

Un componente difficile da mantenere contiene spesso JSX, fetch, trasformazioni, validazione e gestione degli errori nello stesso blocco.

```tsx
function CheckoutPage() {
  // Stato del form
  // Calcolo del totale
  // Applicazione dello sconto
  // Chiamata API
  // Validazione
  // Render dell'intera pagina
}
```

La soluzione consiste nel distribuire le responsabilità:

```text
CheckoutPage.tsx
useCheckout.ts
checkoutService.ts
checkoutValidation.ts
calculateOrderTotal.ts
CheckoutForm.tsx
OrderSummary.tsx
```

## Rendere la logica testabile senza renderizzare la UI

Una funzione di dominio estratta può essere testata senza montare un componente React.

```ts
describe("calculateDiscount", () => {
  it("applica il 20% agli utenti premium", () => {
    expect(calculateDiscount(100, "premium")).toBe(20);
  });
});
```

Questo produce test più veloci, semplici e indipendenti dalla struttura dell’interfaccia.

---

# 7. Refactoring Guidato

## Situazione iniziale

Nel componente iniziale convivono gestione dello stato, chiamate API, filtri, trasformazioni, errori e presentazione.

```tsx
function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDashboardItems()
      .then(setItems)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = items
    .filter(item => {
      if (status === "all") {
        return true;
      }

      return item.status === status;
    })
    .filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

  if (isLoading) {
    return <p>Caricamento...</p>;
  }

  if (error) {
    return <p>Errore durante il caricamento.</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      <select
        value={status}
        onChange={event => setStatus(event.target.value)}
      >
        <option value="all">Tutti</option>
        <option value="active">Attivi</option>
        <option value="inactive">Inattivi</option>
      </select>

      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

Il componente funziona, ma possiede troppi motivi per cambiare.

## Estrazione del servizio dati

La chiamata HTTP viene spostata in un servizio indipendente dall’interfaccia.

```ts
export async function getDashboardItems(): Promise<Item[]> {
  const response = await fetch("/api/dashboard");

  if (!response.ok) {
    throw new Error("Impossibile caricare la dashboard");
  }

  return response.json();
}
```

## Estrazione della logica nel custom hook

Lo stato, il caricamento e i filtri vengono gestiti da un hook dedicato.

```tsx
function useDashboardData() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDashboardItems()
      .then(setItems)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredItems = items
    .filter(item => status === "all" || item.status === status)
    .filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

  return {
    items: filteredItems,
    isLoading,
    error,
    filters: {
      query,
      status,
      setQuery,
      setStatus,
    },
  };
}
```

## Estrazione dei componenti presentazionali

I filtri e il contenuto diventano componenti dedicati.

```tsx
function DashboardFilters({
  query,
  status,
  setQuery,
  setStatus,
}: DashboardFiltersProps) {
  return (
    <div>
      <input
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      <select
        value={status}
        onChange={event => setStatus(event.target.value)}
      >
        <option value="all">Tutti</option>
        <option value="active">Attivi</option>
        <option value="inactive">Inattivi</option>
      </select>
    </div>
  );
}
```

```tsx
function DashboardContent({
  items,
  isLoading,
  error,
}: DashboardContentProps) {
  if (isLoading) {
    return <p>Caricamento...</p>;
  }

  if (error) {
    return <p>Errore durante il caricamento.</p>;
  }

  if (items.length === 0) {
    return <p>Nessun risultato disponibile.</p>;
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Risultato finale

Il componente principale diventa responsabile soltanto della composizione della pagina.

```tsx
function Dashboard() {
  const dashboard = useDashboardData();

  return (
    <DashboardLayout>
      <DashboardFilters {...dashboard.filters} />

      <DashboardContent
        items={dashboard.items}
        isLoading={dashboard.isLoading}
        error={dashboard.error}
      />
    </DashboardLayout>
  );
}
```

Il refactoring non elimina la complessità, ma la distribuisce in unità più leggibili, testabili e modificabili.

---

# 8. Checklist Architetturale Finale

## Dimensione e responsabilità dei componenti

Ogni componente dovrebbe avere una responsabilità riconoscibile. La lunghezza del file è soltanto un segnale: il vero problema è la presenza di troppe logiche non correlate.

* Il componente può essere descritto con una sola frase?
* Contiene responsabilità appartenenti a domini differenti?
* Possiede troppi stati o effetti indipendenti?
* Una sua modifica rischia di rompere parti non correlate?

## Riutilizzabilità

Un componente riutilizzabile non deve conoscere dettagli specifici della pagina in cui viene utilizzato.

* Riceve dati tramite un’interfaccia chiara?
* Contiene testi, URL o regole aziendali codificati direttamente?
* Può essere utilizzato in un altro contesto senza modificarne il codice?
* La sua riutilizzabilità è reale oppure soltanto ipotetica?

## Dipendenze

Le dipendenze devono essere esplicite e limitate.

* Il componente importa servizi che non dovrebbe conoscere?
* Dipende da variabili globali?
* Conosce troppi context?
* Le sue props rappresentano realmente ciò di cui ha bisogno?

## Naming

I nomi devono comunicare responsabilità e intenzione.

* I componenti utilizzano il PascalCase?
* Gli hook iniziano con `use`?
* Le funzioni descrivono un’azione?
* I booleani utilizzano prefissi come `is`, `has`, `can` o `should`?
* I nomi del dominio sono coerenti in tutto il progetto?

## Struttura delle cartelle

La struttura dovrebbe rendere evidente dove cercare una funzionalità.

* Il codice specifico è vicino alla feature di appartenenza?
* I componenti condivisi sono davvero condivisi?
* Servizi, hook e utility possiedono responsabilità distinte?
* È chiara la differenza tra codice di dominio e codice generico?

## Prop drilling

Le props devono attraversare soltanto i livelli necessari.

* Esistono componenti che ricevono props senza utilizzarle?
* Lo stesso dato attraversa numerosi livelli?
* La composition potrebbe ridurre la catena?
* Il dato è abbastanza trasversale da giustificare un Context?
* Un custom hook potrebbe nascondere la sorgente del dato?

## Separazione tra logica e UI

La logica applicativa non dovrebbe essere dispersa nel JSX.

* Il componente esegue direttamente chiamate API?
* Le trasformazioni dei dati sono leggibili?
* Le regole di business possono essere estratte?
* Gli stati di loading, error ed empty sono gestiti in modo coerente?
* La UI può essere testata separatamente dalla logica?

## Presenza di custom hooks

I custom hooks devono rappresentare comportamenti significativi, non semplici wrapper privi di valore.

* Esistono sequenze di stato ed effetti duplicate?
* La logica estratta è riutilizzabile?
* Il nome dell’hook comunica chiaramente il comportamento?
* Il valore restituito espone un’interfaccia comprensibile?
* L’hook nasconde dettagli tecnici senza nascondere informazioni necessarie?

## Domanda conclusiva

Prima di considerare completato il refactoring, bisogna chiedersi:

> Un altro sviluppatore può capire dove si trovano i dati, dove sono applicate le regole e quale componente controlla ogni parte dell’interfaccia senza dover leggere l’intero progetto?
