# `useEffect`

## Definizione

`useEffect` è un Hook di React usato per **sincronizzare un componente con qualcosa di esterno a React**, per esempio:

* una chiamata API;
* un timer;
* un evento del browser;
* `localStorage`;
* una connessione esterna.

Non serve normalmente per calcolare valori da mostrare nell’interfaccia. ([react.dev][1])

## Esempio

```jsx
// Importiamo useEffect e useState da React.
import { useEffect, useState } from "react";

// Creiamo il componente.
export default function UserProfile() {
  // Stato che conterrà l'utente ricevuto dalla API.
  const [user, setUser] = useState(null);

  // L'effetto viene eseguito dopo il rendering iniziale.
  useEffect(() => {
    // Avviamo una richiesta HTTP.
    fetch("https://jsonplaceholder.typicode.com/users/1")
      // Convertiamo la risposta in JSON.
      .then((response) => response.json())
      // Salviamo i dati ricevuti nello stato.
      .then((data) => setUser(data));
  }, []); // Array vuoto: l'effetto parte al montaggio.

  // Mostriamo un messaggio finché i dati non sono disponibili.
  if (!user) {
    return <p>Caricamento...</p>;
  }

  // Mostriamo i dati ricevuti.
  return <h2>{user.name}</h2>;
}
```

## Dipendenze

```jsx
// Viene eseguito dopo ogni rendering.
useEffect(() => {
  console.log("Render");
});

// Viene eseguito al montaggio.
useEffect(() => {
  console.log("Componente montato");
}, []);

// Viene eseguito quando userId cambia.
useEffect(() => {
  console.log("Nuovo utente");
}, [userId]);
```

## Cleanup

Il `return` dell’effetto serve a interrompere timer, eventi o connessioni.

```jsx
// Registriamo un timer quando il componente viene montato.
useEffect(() => {
  // Eseguiamo il codice ogni secondo.
  const timerId = setInterval(() => {
    console.log("Un secondo è passato");
  }, 1000);

  // React esegue questa funzione prima della rimozione
  // del componente o prima di rieseguire l'effetto.
  return () => {
    // Interrompiamo il timer.
    clearInterval(timerId);
  };
}, []);
```

## Perché usarlo

Il rendering deve rimanere puro. Operazioni come richieste HTTP, timer e listener producono effetti collaterali e devono essere eseguite separatamente dal rendering.

La regola utile è:

> Se non devi sincronizzarti con un sistema esterno, probabilmente non ti serve `useEffect`. ([react.dev][1])

[1]: https://react.dev/reference/react/useEffect?utm_source=chatgpt.com "useEffect – React"
