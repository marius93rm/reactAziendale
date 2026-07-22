# Context API: esempio più completo

In questo esempio il `Context` gestisce un utente autenticato e rende disponibili `user`, `login` e `logout` a componenti lontani, senza passare props manualmente.

```jsx
// Importiamo gli strumenti necessari da React.
import { createContext, useContext, useState } from "react";

// Creiamo il Context.
// Il valore iniziale è undefined per riconoscere usi errati.
const AuthContext = createContext(undefined);

// Creiamo il Provider che conterrà stato e funzioni condivise.
function AuthProvider({ children }) {
  // Salviamo nello stato l'utente autenticato.
  const [user, setUser] = useState(null);

  // Creiamo una funzione per simulare il login.
  function login() {
    // Inseriamo nello stato un utente di esempio.
    setUser({
      name: "Marius",
      role: "Trainer",
    });
  }

  // Creiamo una funzione per effettuare il logout.
  function logout() {
    // Rimuoviamo l'utente dallo stato.
    setUser(null);
  }

  // Raggruppiamo dati e funzioni da condividere.
  const authValue = {
    user,
    login,
    logout,
  };

  // Il Provider rende authValue disponibile ai componenti figli.
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Creiamo un Custom Hook per leggere il Context.
function useAuth() {
  // Recuperiamo il valore dal Provider più vicino.
  const context = useContext(AuthContext);

  // Controlliamo che il componente sia dentro AuthProvider.
  if (context === undefined) {
    // Generiamo un errore chiaro in caso di utilizzo scorretto.
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }

  // Restituiamo il valore condiviso.
  return context;
}

// Componente principale dell'applicazione.
export default function App() {
  // Avvolgiamo l'applicazione nel Provider.
  return (
    <AuthProvider>
      <Header />
      <Dashboard />
    </AuthProvider>
  );
}

// Componente intermedio.
function Header() {
  // Header non riceve props dall'esterno.
  return (
    <header>
      <h1>Dashboard aziendale</h1>

      {/* UserControls legge direttamente il Context. */}
      <UserControls />
    </header>
  );
}

// Componente che mostra i controlli di autenticazione.
function UserControls() {
  // Estraiamo dati e funzioni dal Context.
  const { user, login, logout } = useAuth();

  // Se l'utente non è autenticato mostriamo il login.
  if (!user) {
    return (
      <button onClick={login}>
        Accedi
      </button>
    );
  }

  // Se l'utente è autenticato mostriamo nome e logout.
  return (
    <div>
      <span>
        {user.name} - {user.role}
      </span>

      <button onClick={logout}>
        Esci
      </button>
    </div>
  );
}

// Componente che usa lo stesso Context.
function Dashboard() {
  // Recuperiamo l'utente condiviso.
  const { user } = useAuth();

  // Mostriamo un messaggio se l'utente non è autenticato.
  if (!user) {
    return <p>Effettua il login per vedere la dashboard.</p>;
  }

  // Mostriamo il contenuto riservato.
  return (
    <main>
      <h2>Benvenuto, {user.name}</h2>

      <p>Ruolo corrente: {user.role}</p>
    </main>
  );
}
```

## Come funziona

`createContext` crea il contenitore condiviso, `AuthProvider` mantiene lo stato dell’utente e distribuisce valori e funzioni, mentre `useAuth` permette ai componenti di leggere il Context in modo più pulito. `Header` e `Dashboard` non ricevono nessuna prop: recuperano direttamente i dati necessari. Questo evita il **prop drilling** e centralizza una responsabilità trasversale come l’autenticazione. Il Custom Hook è importante perché nasconde `useContext`, rende il codice più leggibile e produce un errore esplicito quando il Context viene usato fuori dal Provider.
