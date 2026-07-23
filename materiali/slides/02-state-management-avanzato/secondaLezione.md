# Modulo 2 - State Management avanzato in React

Il modulo affronta la gestione dello stato nelle applicazioni React aziendali, distinguendo i dati controllati dal client dai dati provenienti dal backend. L’obiettivo non è soltanto conoscere gli Hook, ma scegliere correttamente dove collocare ogni informazione, come modellarne le transizioni e come mantenere l’interfaccia sincronizzata con il server.

---

## 1. Stato locale, globale, derivato, persistente e server state

Non tutti i dati presenti in un’applicazione hanno la stessa natura. Classificarli correttamente permette di evitare duplicazioni, sincronizzazioni manuali e Context troppo complessi.

* **Stato locale**: appartiene a un componente o a una piccola parte dell’interfaccia.
* **Stato globale**: deve essere condiviso tra componenti distanti.
* **Stato derivato**: viene calcolato partendo da altri dati già disponibili.
* **Stato persistente**: deve sopravvivere al refresh o alla chiusura della pagina.
* **Server state**: proviene dal backend, può diventare obsoleto e deve essere sincronizzato.

### Esempio di codice

```tsx
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

type ProductDashboardProps = {
  products: Product[]; // Server state ricevuto dal backend o da una query.
};

export function ProductDashboard({
  products,
}: ProductDashboardProps) {
  // STATO LOCALE:
  // Serve soltanto a questo componente.
  const [search, setSearch] = useState("");

  // STATO PERSISTENTE:
  // Il valore iniziale viene recuperato dal browser.
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem("compact-view") === "true";
  });

  // Salva la preferenza ogni volta che cambia.
  useEffect(() => {
    localStorage.setItem(
      "compact-view",
      String(compactView)
    );
  }, [compactView]);

  // STATO DERIVATO:
  // Non viene salvato con useState perché può essere
  // calcolato direttamente da products e search.
  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return product.active && matchesSearch;
    });
  }, [products, search]);

  // Anche il totale è un dato derivato.
  const totalValue = visibleProducts.reduce(
    (total, product) => total + product.price,
    0
  );

  return (
    <section>
      <input
        value={search}
        placeholder="Cerca prodotto"
        onChange={(event) => setSearch(event.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={compactView}
          onChange={() =>
            setCompactView((current) => !current)
          }
        />
        Vista compatta
      </label>

      <p>Prodotti visibili: {visibleProducts.length}</p>
      <p>Valore totale: € {totalValue}</p>

      <ul className={compactView ? "compact" : ""}>
        {visibleProducts.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

`search` è locale perché interessa soltanto la dashboard. `compactView` è persistente perché viene salvato in `localStorage`. `visibleProducts` e `totalValue` sono derivati e non devono essere duplicati in un altro `useState`. `products`, invece, rappresenta server state: il backend ne rimane la fonte autorevole.

Una regola utile è questa: se un valore può essere calcolato da props o stato esistente, probabilmente non deve essere salvato come nuovo stato.

---

## 2. Context API: vantaggi, limiti e prevenzione dei render inutili

Context API permette di condividere dati tra componenti distanti senza passare props attraverso tutti i livelli intermedi.

È utile per informazioni come:

* utente autenticato;
* tema;
* lingua;
* permessi;
* configurazione applicativa;
* stato condiviso di una specifica feature.

Context non è però uno store completo. Non offre automaticamente cache, selector, persistenza, gestione delle richieste o invalidazione dei dati.

Quando il valore di un provider cambia, tutti i componenti che leggono quel Context vengono aggiornati. Per questo è preferibile dividere i Context in base alla responsabilità e alla frequenza di aggiornamento.

### Esempio di codice

```tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

type User = {
  id: number;
  name: string;
  role: "admin" | "operator";
};

type AuthStateContextValue = {
  user: User | null;
};

type AuthActionsContextValue = {
  login: (user: User) => void;
  logout: () => void;
};

// Context dedicato ai dati della sessione.
const AuthStateContext =
  createContext<AuthStateContextValue | null>(null);

// Context separato per le azioni.
const AuthActionsContext =
  createContext<AuthActionsContextValue | null>(null);

export function AuthProvider({
  children,
}: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  function login(nextUser: User) {
    setUser(nextUser);
  }

  function logout() {
    setUser(null);
  }

  // L'oggetto cambia soltanto quando cambia user.
  const stateValue = useMemo(
    () => ({ user }),
    [user]
  );

  // Le azioni vengono fornite separatamente.
  const actionsValue = useMemo(
    () => ({
      login,
      logout,
    }),
    []
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error(
      "useAuthState deve essere usato dentro AuthProvider"
    );
  }

  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);

  if (!context) {
    throw new Error(
      "useAuthActions deve essere usato dentro AuthProvider"
    );
  }

  return context;
}
```

Separare stato e azioni permette ai componenti che devono soltanto eseguire `login` o `logout` di non dipendere direttamente dal valore dell’utente.

In un progetto complesso è preferibile creare Context distinti, per esempio:

```text
AuthContext
ThemeContext
PermissionsContext
DashboardFiltersContext
```

Un unico `AppContext` contenente utente, tema, ordini, filtri, notifiche e stato della sidebar produrrebbe un forte accoppiamento e aggiornamenti troppo ampi.

Le principali strategie per ridurre render inutili sono:

1. mantenere il provider vicino alla feature che lo utilizza;
2. separare Context con responsabilità diverse;
3. evitare oggetti ricreati inutilmente nel `value`;
4. non inserire nel Context dati derivabili;
5. non usare Context come cache per le chiamate API;
6. valutare store con selector quando servono sottoscrizioni molto granulari.

---

## 3. useReducer per transizioni prevedibili

`useReducer` è adatto quando lo stato contiene più proprietà collegate oppure quando esistono transizioni precise.

Con `useState`, la logica può finire distribuita tra molti handler. Con `useReducer`, le modifiche vengono centralizzate in una funzione pura:

```ts
nuovoStato = reducer(statoCorrente, azione);
```

Le action dovrebbero descrivere eventi applicativi, come `orderApproved`, invece di operazioni generiche come `setStatus`.

### Esempio di codice

```tsx
import { useReducer } from "react";

type OrderStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected";

type OrderState = {
  status: OrderStatus;
  rejectionReason: string | null;
};

type OrderAction =
  | { type: "orderSubmitted" }
  | { type: "orderApproved" }
  | { type: "orderRejected"; reason: string }
  | { type: "orderReset" };

const initialState: OrderState = {
  status: "draft",
  rejectionReason: null,
};

function orderReducer(
  state: OrderState,
  action: OrderAction
): OrderState {
  switch (action.type) {
    case "orderSubmitted":
      // Un ordine può essere inviato solo se è in bozza.
      if (state.status !== "draft") {
        return state;
      }

      return {
        status: "submitted",
        rejectionReason: null,
      };

    case "orderApproved":
      // L'approvazione è valida solo dopo l'invio.
      if (state.status !== "submitted") {
        return state;
      }

      return {
        status: "approved",
        rejectionReason: null,
      };

    case "orderRejected":
      // Anche il rifiuto è valido solo da submitted.
      if (state.status !== "submitted") {
        return state;
      }

      return {
        status: "rejected",
        rejectionReason: action.reason,
      };

    case "orderReset":
      return initialState;

    default: {
      // TypeScript segnala eventuali action non gestite.
      const unhandledAction: never = action;
      throw new Error(
        `Azione non gestita: ${unhandledAction}`
      );
    }
  }
}

export function OrderWorkflow() {
  const [state, dispatch] = useReducer(
    orderReducer,
    initialState
  );

  return (
    <section>
      <p>Stato ordine: {state.status}</p>

      {state.rejectionReason && (
        <p>Motivo: {state.rejectionReason}</p>
      )}

      <button
        disabled={state.status !== "draft"}
        onClick={() =>
          dispatch({ type: "orderSubmitted" })
        }
      >
        Invia
      </button>

      <button
        disabled={state.status !== "submitted"}
        onClick={() =>
          dispatch({ type: "orderApproved" })
        }
      >
        Approva
      </button>

      <button
        disabled={state.status !== "submitted"}
        onClick={() =>
          dispatch({
            type: "orderRejected",
            reason: "Documentazione incompleta",
          })
        }
      >
        Rifiuta
      </button>

      <button
        onClick={() =>
          dispatch({ type: "orderReset" })
        }
      >
        Reimposta
      </button>
    </section>
  );
}
```

Il reducer impedisce transizioni non valide. Un ordine non può essere approvato direttamente dallo stato `draft`.

Il reducer deve rimanere puro: non deve contenere chiamate HTTP, timer, accesso al DOM o scritture in `localStorage`. Questi side effect devono essere eseguiti fuori dal reducer, mentre il risultato viene comunicato tramite una nuova action.

---

## 4. Loading, error, empty state, retry e aggiornamento asincrono

Un’interfaccia asincrona non ha soltanto due condizioni, “caricamento” e “dati disponibili”. Occorre distinguere almeno:

* caricamento iniziale;
* successo con dati;
* successo senza risultati;
* errore iniziale;
* aggiornamento in background;
* errore durante il refresh.

Un errore non deve essere confuso con un empty state. Se il backend restituisce correttamente una lista vuota, la richiesta è riuscita.

### Esempio di codice

```tsx
type Order = {
  id: number;
  customer: string;
};

type OrdersViewProps = {
  orders?: Order[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function OrdersView({
  orders,
  isLoading,
  isFetching,
  error,
  onRetry,
}: OrdersViewProps) {
  // Primo caricamento:
  // non esistono ancora dati utilizzabili.
  if (isLoading && !orders) {
    return <p role="status">Caricamento ordini...</p>;
  }

  // Errore iniziale:
  // la richiesta è fallita e non abbiamo dati precedenti.
  if (error && !orders) {
    return (
      <section role="alert">
        <h2>Impossibile caricare gli ordini</h2>
        <p>{error.message}</p>

        <button onClick={onRetry}>
          Riprova
        </button>
      </section>
    );
  }

  // Empty state:
  // la richiesta è riuscita, ma la lista è vuota.
  if (orders?.length === 0) {
    return (
      <section>
        <h2>Nessun ordine trovato</h2>
        <p>Modifica i filtri o crea un nuovo ordine.</p>
      </section>
    );
  }

  return (
    <section>
      {/* Durante il refresh i dati precedenti rimangono visibili. */}
      {isFetching && (
        <p role="status">
          Aggiornamento dati in corso...
        </p>
      )}

      {/* Un errore di refresh non cancella la lista precedente. */}
      {error && orders && (
        <div role="alert">
          I dati potrebbero non essere aggiornati.

          <button onClick={onRetry}>
            Riprova
          </button>
        </div>
      )}

      <ul>
        {orders?.map((order) => (
          <li key={order.id}>
            {order.customer}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Durante il refresh è preferibile mantenere visibili i dati già caricati. Sostituire ogni volta l’intera pagina con uno spinner produce un’interfaccia instabile e interrompe la lettura.

Il retry può essere:

* **automatico**, per problemi temporanei di rete o errori server;
* **manuale**, quando l’utente deve correggere dati oppure l’operazione non deve essere ripetuta automaticamente.

---

## 5. Data fetching: separazione tra API, trasformazione e rendering

La chiamata HTTP non dovrebbe essere scritta direttamente dentro il componente che renderizza la pagina.

Una struttura più mantenibile separa:

1. accesso HTTP;
2. funzione API della feature;
3. trasformazione del dato;
4. hook di caricamento;
5. rendering.

### Accesso API

```ts
// ordersApi.ts

export type OrderDto = {
  order_id: number;
  customer_name: string;
  total_cents: number;
};

export async function getOrders(
  signal?: AbortSignal
): Promise<OrderDto[]> {
  const response = await fetch("/api/orders", {
    signal,
  });

  // fetch non genera automaticamente un errore per 404 o 500.
  if (!response.ok) {
    throw new Error(
      `Errore HTTP ${response.status}`
    );
  }

  return response.json();
}
```

### Trasformazione del dato

```ts
// orderMapper.ts

import type { OrderDto } from "./ordersApi";

export type Order = {
  id: number;
  customerName: string;
  total: number;
};

export function mapOrderDto(
  dto: OrderDto
): Order {
  return {
    // Converte il naming del backend.
    id: dto.order_id,

    // Espone un nome coerente con il frontend.
    customerName: dto.customer_name,

    // Converte i centesimi in euro.
    total: dto.total_cents / 100,
  };
}
```

### Hook di caricamento

```tsx
// useOrders.ts

import { useEffect, useState } from "react";
import { getOrders } from "./ordersApi";
import {
  mapOrderDto,
  type Order,
} from "./orderMapper";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Permette di annullare la richiesta
    // quando il componente viene smontato.
    const controller = new AbortController();

    async function loadOrders() {
      try {
        setStatus("loading");
        setError(null);

        const orderDtos = await getOrders(
          controller.signal
        );

        // Il componente riceverà dati già trasformati.
        const mappedOrders =
          orderDtos.map(mapOrderDto);

        setOrders(mappedOrders);
        setStatus("success");
      } catch (caughtError) {
        // Ignora l'errore causato dalla cancellazione.
        if (controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Errore sconosciuto")
        );

        setStatus("error");
      }
    }

    loadOrders();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    orders,
    status,
    error,
  };
}
```

### Rendering

```tsx
export function OrdersPage() {
  const { orders, status, error } = useOrders();

  if (status === "loading") {
    return <p>Caricamento...</p>;
  }

  if (status === "error") {
    return <p>{error?.message}</p>;
  }

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          {order.customerName}: € {order.total}
        </li>
      ))}
    </ul>
  );
}
```

La pagina non conosce l’URL dell’API, il formato del DTO o la conversione dei centesimi. Il mapping protegge il frontend dai dettagli tecnici del backend.

In applicazioni più complesse, il custom hook manuale può essere sostituito da una libreria dedicata al server state, come TanStack Query.

---

## 6. Caching, invalidazione, refresh e sincronizzazione

Una cache memorizza temporaneamente dati già recuperati per evitare richieste duplicate e rendere l’interfaccia più veloce.

Una cache deve però sapere:

* come identificare il dato;
* per quanto tempo considerarlo aggiornato;
* quando invalidarlo;
* quando effettuare un nuovo fetch;
* come aggiornarsi dopo una mutation.

Con TanStack Query, ogni dato viene identificato tramite una **query key**.

### Esempio di codice

```tsx
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

type Order = {
  id: number;
  customerName: string;
  status: "pending" | "approved";
};

async function getOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders");

  if (!response.ok) {
    throw new Error("Errore nel caricamento");
  }

  return response.json();
}

async function approveOrder(
  orderId: number
): Promise<Order> {
  const response = await fetch(
    `/api/orders/${orderId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "approved",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Aggiornamento non riuscito");
  }

  return response.json();
}

export function OrdersPage() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    // La query key identifica la lista nella cache.
    queryKey: ["orders"],

    // Funzione che recupera il dato.
    queryFn: getOrders,

    // Per 30 secondi i dati sono considerati freschi.
    staleTime: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: approveOrder,

    onSuccess: () => {
      // Segnala che la lista potrebbe essere obsoleta.
      // TanStack Query eseguirà un nuovo fetch.
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  if (ordersQuery.isPending) {
    return <p>Caricamento...</p>;
  }

  if (ordersQuery.isError) {
    return (
      <button
        onClick={() => ordersQuery.refetch()}
      >
        Riprova
      </button>
    );
  }

  return (
    <section>
      {ordersQuery.isFetching && (
        <p>Aggiornamento...</p>
      )}

      <ul>
        {ordersQuery.data.map((order) => (
          <li key={order.id}>
            {order.customerName}: {order.status}

            <button
              disabled={approveMutation.isPending}
              onClick={() =>
                approveMutation.mutate(order.id)
              }
            >
              Approva
            </button>
          </li>
        ))}
      </ul>

      <button
        disabled={ordersQuery.isFetching}
        onClick={() => ordersQuery.refetch()}
      >
        Aggiorna dati
      </button>
    </section>
  );
}
```

`staleTime` stabilisce per quanto tempo il dato viene considerato fresco. L’invalidazione dichiara invece che una query potrebbe non essere più affidabile.

Dopo l’approvazione di un ordine, la lista viene invalidata perché il backend potrebbe aver modificato altri campi, ordinamento o conteggi.

La sincronizzazione può avvenire tramite:

* refresh manuale;
* refetch al ritorno sulla pagina;
* polling periodico;
* invalidazione dopo mutation;
* WebSocket o Server-Sent Events per dati in tempo reale.

Il backend deve comunque rimanere la fonte autorevole.

---

## 7. Optimistic update e rollback

Con un **optimistic update**, l’interfaccia viene aggiornata prima che il backend confermi l’operazione.

Il flusso è:

1. salvare il dato precedente;
2. aggiornare immediatamente la cache;
3. inviare la richiesta;
4. confermare il risultato in caso di successo;
5. ripristinare il dato precedente in caso di errore;
6. invalidare la query per riallinearla al server.

Questo pattern migliora la velocità percepita, ma deve essere utilizzato quando il risultato è prevedibile e il rollback è possibile.

### Esempio di codice

```tsx
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Order = {
  id: number;
  customerName: string;
  status: "pending" | "approved";
};

async function approveOrder(
  orderId: number
): Promise<Order> {
  const response = await fetch(
    `/api/orders/${orderId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "approved",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Approvazione fallita");
  }

  return response.json();
}

export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveOrder,

    onMutate: async (orderId) => {
      // Ferma eventuali aggiornamenti in corso.
      await queryClient.cancelQueries({
        queryKey: ["orders"],
      });

      // Salva una copia della lista precedente.
      const previousOrders =
        queryClient.getQueryData<Order[]>([
          "orders",
        ]);

      // Aggiorna immediatamente la cache.
      queryClient.setQueryData<Order[]>(
        ["orders"],
        (currentOrders = []) =>
          currentOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "approved",
                }
              : order
          )
      );

      // Lo snapshot sarà disponibile in onError.
      return {
        previousOrders,
      };
    },

    onError: (
      _error,
      _orderId,
      context
    ) => {
      // Ripristina la lista precedente.
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders"],
          context.previousOrders
        );
      }
    },

    onSettled: () => {
      // Dopo successo o errore, verifica il dato sul server.
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
}
```

### Utilizzo

```tsx
export function ApproveButton({
  orderId,
}: {
  orderId: number;
}) {
  const approveOrder = useApproveOrder();

  return (
    <div>
      <button
        disabled={approveOrder.isPending}
        onClick={() =>
          approveOrder.mutate(orderId)
        }
      >
        {approveOrder.isPending
          ? "Salvataggio..."
          : "Approva"}
      </button>

      {approveOrder.isError && (
        <p role="alert">
          Operazione non riuscita. Lo stato precedente
          è stato ripristinato.
        </p>
      )}
    </div>
  );
}
```

`onMutate` salva la lista precedente e applica subito la modifica. Se il server restituisce un errore, `onError` esegue il rollback. `onSettled` invalida infine la query per verificare lo stato reale del backend.

L’optimistic update è indicato per operazioni semplici e reversibili, come:

* like;
* toggle;
* cambio di stato;
* riordinamento;
* rinomina.

È meno adatto per pagamenti, cancellazioni importanti o operazioni che dipendono da regole backend complesse.

---

# Riepilogo

Lo stato deve essere classificato prima di scegliere lo strumento:

* `useState` per stato locale semplice;
* `useReducer` per transizioni articolate;
* Context per stato client realmente condiviso;
* `localStorage` o IndexedDB per persistenza;
* valori calcolati per stato derivato;
* TanStack Query o strumenti equivalenti per server state.

Un’architettura corretta separa stato della UI e dati remoti. Il client controlla interazioni, filtri e preferenze; il backend rimane la fonte autorevole per i dati aziendali. Cache, invalidazione, retry e optimistic update servono a mantenere queste due realtà sincronizzate senza sacrificare la qualità dell’esperienza utente.
