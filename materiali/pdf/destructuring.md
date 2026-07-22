



# Destructuring

## Definizione

Il **destructuring** è una sintassi di JavaScript che permette di estrarre valori da **oggetti** e **array**, assegnandoli direttamente a variabili.

Invece di accedere ripetutamente ai dati con:

```js
utente.nome;
utente.email;
utente.ruolo;
```

possiamo “spacchettare” l’oggetto:

```js
const { nome, email, ruolo } = utente;
```

È una parte fondamentale di JavaScript moderno e viene usata continuamente in React, soprattutto con **props**, **state**, **hook**, parametri delle funzioni e risposte delle API. Nel programma del corso è infatti indicata tra i prerequisiti JavaScript necessari per lavorare con React a livello intermedio-avanzato. fileciteturn0file0

---

## 1. Destructuring degli oggetti

```js
// Creiamo un oggetto che rappresenta un utente.
const utente = {
  // Proprietà contenente il nome.
  nome: "Marius",

  // Proprietà contenente l'email.
  email: "marius@example.com",

  // Proprietà contenente il ruolo aziendale.
  ruolo: "trainer",
};

// Estraiamo le proprietà nome, email e ruolo dall'oggetto.
// I nomi delle variabili devono corrispondere alle chiavi dell'oggetto.
const { nome, email, ruolo } = utente;

// Stampiamo il valore estratto dalla proprietà nome.
console.log(nome);

// Stampiamo il valore estratto dalla proprietà email.
console.log(email);

// Stampiamo il valore estratto dalla proprietà ruolo.
console.log(ruolo);
```

### Senza destructuring

```js
// Recuperiamo manualmente ogni proprietà dall'oggetto.
const nome = utente.nome;

// Recuperiamo manualmente l'email.
const email = utente.email;

// Recuperiamo manualmente il ruolo.
const ruolo = utente.ruolo;
```

### Perché usarlo

Il destructuring evita ripetizioni come `utente.nome`, `utente.email` e `utente.ruolo`.

Il codice diventa:

- più corto;
- più leggibile;
- più esplicito sui dati realmente utilizzati;
- più comodo quando l’oggetto contiene molte proprietà.

---

## 2. Rinominare una proprietà

A volte il nome della proprietà non è adatto alla variabile locale oppure esiste già una variabile con lo stesso nome.

```js
// Creiamo un oggetto proveniente, per esempio, da una API.
const apiUser = {
  // La API utilizza il nome della proprietà user_name.
  user_name: "Marius",

  // La API utilizza il nome della proprietà user_role.
  user_role: "admin",
};

// Estraiamo user_name e lo rinominiamo nella variabile username.
// Estraiamo user_role e lo rinominiamo nella variabile role.
const {
  user_name: username,
  user_role: role,
} = apiUser;

// Stampiamo la nuova variabile username.
console.log(username);

// Stampiamo la nuova variabile role.
console.log(role);
```

La sintassi segue questa logica:

```js
const { nomeProprietà: nuovoNomeVariabile } = oggetto;
```

Non viene modificato l’oggetto originale. Stiamo soltanto scegliendo un nome diverso per la variabile locale.

---

## 3. Valori predefiniti

Possiamo assegnare un valore di default quando una proprietà è assente oppure vale `undefined`.

```js
// Creiamo un oggetto che non contiene la proprietà tema.
const impostazioni = {
  // La lingua è presente.
  lingua: "it",
};

// Estraiamo la proprietà lingua.
// Estraiamo anche tema, assegnando "light" come valore predefinito.
const {
  lingua,
  tema = "light",
} = impostazioni;

// Stampa "it" perché la proprietà lingua esiste.
console.log(lingua);

// Stampa "light" perché la proprietà tema non esiste.
console.log(tema);
```

Il valore predefinito **non viene utilizzato con `null`**:

```js
// Creiamo un oggetto in cui tema esiste ma vale null.
const configurazione = {
  // null è un valore esplicitamente assegnato.
  tema: null,
};

// Il valore "light" viene usato soltanto con undefined,
// quindi tema resterà null.
const { tema = "light" } = configurazione;

// Stampa null.
console.log(tema);
```

---

## 4. Destructuring annidato

Possiamo estrarre valori contenuti dentro oggetti annidati.

```js
// Creiamo un oggetto con una struttura annidata.
const dipendente = {
  // Proprietà principale del dipendente.
  nome: "Marius",

  // Oggetto annidato con i dati del reparto.
  reparto: {
    // Nome del reparto.
    nome: "Formazione",

    // Sede del reparto.
    sede: "Brașov",
  },
};

// Estraiamo nome dall'oggetto principale e lo rinominiamo dipendenteNome.
// Entriamo poi nell'oggetto reparto.
// Dal reparto estraiamo nome rinominandolo repartoNome.
// Estraiamo infine la sede.
const {
  nome: dipendenteNome,
  reparto: {
    nome: repartoNome,
    sede,
  },
} = dipendente;

// Stampa il nome del dipendente.
console.log(dipendenteNome);

// Stampa il nome del reparto.
console.log(repartoNome);

// Stampa la sede.
console.log(sede);
```

Qui la rinomina è necessaria perché sia il dipendente sia il reparto possiedono una proprietà chiamata `nome`.

Attenzione: con questa istruzione non viene creata una variabile chiamata `reparto`. Vengono create soltanto `dipendenteNome`, `repartoNome` e `sede`.

---

## 5. Destructuring degli array

Con gli array, i valori vengono estratti in base alla **posizione**, non al nome.

```js
// Creiamo un array contenente tre tecnologie.
const tecnologie = ["React", "TypeScript", "Vite"];

// Il primo elemento viene assegnato a frontend.
// Il secondo elemento viene assegnato a linguaggio.
// Il terzo elemento viene assegnato a buildTool.
const [frontend, linguaggio, buildTool] = tecnologie;

// Stampa "React".
console.log(frontend);

// Stampa "TypeScript".
console.log(linguaggio);

// Stampa "Vite".
console.log(buildTool);
```

Negli oggetti conta il nome della proprietà:

```js
const { nome, ruolo } = utente;
```

Negli array conta l’ordine:

```js
const [primo, secondo] = valori;
```

---

## 6. Saltare elementi di un array

```js
// Creiamo un array con tre colori.
const colori = ["rosso", "verde", "blu"];

// Estraiamo il primo elemento.
// Lasciamo vuota la seconda posizione per saltare "verde".
// Estraiamo il terzo elemento.
const [primoColore, , terzoColore] = colori;

// Stampa "rosso".
console.log(primoColore);

// Stampa "blu".
console.log(terzoColore);
```

La virgola vuota indica che quella posizione viene ignorata.

---

## 7. Rest operator nel destructuring

L’operatore `...` raccoglie tutti gli elementi o le proprietà rimanenti.

### Con un array

```js
// Creiamo un array con quattro argomenti del corso.
const argomenti = [
  "React",
  "State management",
  "Performance",
  "Testing",
];

// Estraiamo il primo elemento nella variabile principale.
// Raccogliamo tutti gli elementi successivi nell'array altriArgomenti.
const [principale, ...altriArgomenti] = argomenti;

// Stampa "React".
console.log(principale);

// Stampa un array con gli altri tre elementi.
console.log(altriArgomenti);
```

### Con un oggetto

```js
// Creiamo un oggetto contenente dati pubblici e sensibili.
const account = {
  // Identificativo dell'account.
  id: 10,

  // Nome pubblico.
  nome: "Marius",

  // Ruolo applicativo.
  ruolo: "admin",

  // Dato che non vogliamo includere nel nuovo oggetto.
  password: "segreta",
};

// Estraiamo password in una variabile separata.
// Raccogliamo tutte le proprietà rimanenti nell'oggetto accountSicuro.
const {
  password,
  ...accountSicuro
} = account;

// Contiene id, nome e ruolo, ma non password.
console.log(accountSicuro);
```

Questo pattern viene spesso usato per escludere proprietà prima di passare un oggetto a un altro componente o servizio.

Non rappresenta però una vera misura di sicurezza: il valore `password` continua a esistere in memoria e nell’oggetto originale.

---

# Destructuring in React

## 8. Destructuring delle props

Senza destructuring:

```jsx
// Il componente riceve tutte le props dentro l'oggetto props.
function UserCard(props) {
  // Restituiamo la struttura visiva del componente.
  return (
    // Contenitore della card.
    <article>
      {/* Leggiamo nome attraverso props.nome. */}
      <h2>{props.nome}</h2>

      {/* Leggiamo ruolo attraverso props.ruolo. */}
      <p>{props.ruolo}</p>
    </article>
  );
}
```

Con destructuring:

```jsx
// Destrutturiamo nome e ruolo direttamente nel parametro della funzione.
function UserCard({ nome, ruolo }) {
  // Restituiamo la struttura visiva del componente.
  return (
    // Contenitore della card.
    <article>
      {/* Utilizziamo direttamente la variabile nome. */}
      <h2>{nome}</h2>

      {/* Utilizziamo direttamente la variabile ruolo. */}
      <p>{ruolo}</p>
    </article>
  );
}
```

Utilizzo del componente:

```jsx
// Esportiamo il componente principale dell'applicazione.
export default function App() {
  // Restituiamo il componente UserCard.
  return (
    // Passiamo nome e ruolo come props.
    <UserCard
      nome="Marius"
      ruolo="React Trainer"
    />
  );
}
```

### Perché è utile nelle props

La firma del componente comunica immediatamente quali dati vengono utilizzati:

```jsx
function UserCard({ nome, ruolo })
```

È più chiara di:

```jsx
function UserCard(props)
```

Nel primo caso vediamo subito che il componente dipende da `nome` e `ruolo`.

---

## 9. Destructuring di `useState`

`useState` restituisce un array con due elementi:

1. il valore corrente dello stato;
2. la funzione che aggiorna lo stato.

```jsx
// Importiamo l'Hook useState dalla libreria React.
import { useState } from "react";

// Dichiariamo il componente Counter.
export default function Counter() {
  // useState restituisce un array.
  // Il primo elemento viene assegnato a count.
  // Il secondo elemento viene assegnato a setCount.
  // Il valore iniziale dello stato è 0.
  const [count, setCount] = useState(0);

  // Creiamo la funzione che incrementa il contatore.
  function incrementa() {
    // Aggiorniamo lo stato partendo dal valore precedente.
    setCount((valorePrecedente) => valorePrecedente + 1);
  }

  // Restituiamo l'interfaccia del componente.
  return (
    // Contenitore del contatore.
    <section>
      {/* Mostriamo il valore corrente dello stato. */}
      <p>Conteggio: {count}</p>

      {/* Al click eseguiamo la funzione incrementa. */}
      <button onClick={incrementa}>
        Incrementa
      </button>
    </section>
  );
}
```

Concettualmente:

```js
// React restituisce qualcosa di simile a questo array.
const risultato = [0, funzioneDiAggiornamento];

// Estraiamo i due elementi in base alla loro posizione.
const [count, setCount] = risultato;
```

Possiamo scegliere liberamente i nomi perché negli array conta la posizione:

```js
const [aperto, setAperto] = useState(false);
const [utenti, setUtenti] = useState([]);
const [errore, setErrore] = useState(null);
```

---

# Perché il destructuring è importante

Il destructuring non serve soltanto a scrivere meno codice. Serve a rendere esplicite le dipendenze.

In questo componente:

```jsx
function UserCard({ nome, ruolo }) {
```

dichiariamo chiaramente:

> Questo componente ha bisogno soltanto di `nome` e `ruolo`.

Questo migliora:

- leggibilità;
- comprensione delle props;
- manutenzione;
- code review;
- separazione delle responsabilità;
- individuazione dei dati realmente utilizzati.

## Regola pratica

Usa il destructuring quando rende evidente **quali dati stai utilizzando**.

Evita però destructuring troppo profondi o enormi:

```js
const {
  user: {
    company: {
      department: {
        manager: {
          profile: {
            name,
          },
        },
      },
    },
  },
} = response;
```

Una struttura del genere è fragile e difficile da leggere. In quel caso è spesso meglio separare i passaggi:

```js
// Recuperiamo l'utente dalla risposta.
const { user } = response;

// Recuperiamo l'azienda dell'utente.
const { company } = user;

// Recuperiamo il reparto dell'azienda.
const { department } = company;

// Recuperiamo il manager del reparto.
const { manager } = department;

// Recuperiamo infine il nome dal profilo.
const { name } = manager.profile;
```

Il principio non è “usare sempre destructuring”, ma usarlo quando rende il codice più chiaro e mantenibile.